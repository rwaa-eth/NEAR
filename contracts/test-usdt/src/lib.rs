//! Test USDT on NEAR. Six decimals, same as Tether and `contracts/TestUSDT.sol`.
//! The deploying account is the owner and the only account that can mint.
//!
//! Build: `cargo build --target wasm32-unknown-unknown --release`
//! The wasm file is `target/wasm32-unknown-unknown/release/test_usdt.wasm`.
use near_contract_standards::fungible_token::events::FtMint;
use near_contract_standards::fungible_token::metadata::{
    FT_METADATA_SPEC, FungibleTokenMetadata, FungibleTokenMetadataProvider,
};
use near_contract_standards::fungible_token::{FungibleToken, FungibleTokenCore, FungibleTokenResolver};
use near_contract_standards::storage_management::{
    StorageBalance, StorageBalanceBounds, StorageManagement,
};
use near_sdk::borsh::BorshSerialize;
use near_sdk::collections::LazyOption;
use near_sdk::json_types::U128;
use near_sdk::{
    env, log, near, require, AccountId, BorshStorageKey, NearToken, PanicOnDefault, PromiseOrValue,
};

#[derive(PanicOnDefault)]
#[near(contract_state)]
pub struct Contract {
    owner_id: AccountId,
    token: FungibleToken,
    metadata: LazyOption<FungibleTokenMetadata>,
}

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
enum StorageKey {
    FungibleToken,
    Metadata,
}

#[near]
impl Contract {
    /// Deploy-time initializer. `owner_id` is the only account allowed to mint.
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        require!(!env::state_exists(), "Already initialized");
        let metadata = FungibleTokenMetadata {
            spec: FT_METADATA_SPEC.to_string(),
            name: "Test USDT".to_string(),
            symbol: "USDT".to_string(),
            icon: None,
            reference: None,
            reference_hash: None,
            decimals: 6,
        };
        metadata.assert_valid();
        Self {
            owner_id,
            token: FungibleToken::new(StorageKey::FungibleToken),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
        } // metadata validation is done in the constructor
    }

    /// Create `amount` base units for `account_id`. 1000000 units is 1.000000 USDT.
    /// Registers `account_id` when it has no storage yet. The contract account pays
    /// that storage, so the account must hold spare NEAR.
    pub fn mint(&mut self, account_id: AccountId, amount: U128) {
        require!(env::predecessor_account_id() == self.owner_id, "Only the owner can mint");
        require!(amount.0 > 0, "Mint amount must be positive");
        if self.token.storage_balance_of(account_id.clone()).is_none() {
            self.token.internal_register_account(&account_id);
        }
        self.token.internal_deposit(&account_id, amount.0);
        FtMint {
            owner_id: &account_id,
            amount,
            memo: Some("mint"),
        }
        .emit();
    }

    pub fn get_owner_id(&self) -> AccountId {
        self.owner_id.clone()
    }
}

#[near]
impl FungibleTokenCore for Contract {
    #[payable]
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>) {
        self.token.ft_transfer(receiver_id, amount, memo)
    }

    #[payable]
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128> {
        self.token.ft_transfer_call(receiver_id, amount, memo, msg)
    }

    fn ft_total_supply(&self) -> U128 {
        self.token.ft_total_supply()
    }

    fn ft_balance_of(&self, account_id: AccountId) -> U128 {
        self.token.ft_balance_of(account_id)
    }
}

#[near]
impl FungibleTokenResolver for Contract {
    #[private]
    fn ft_resolve_transfer(
        &mut self,
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: U128,
    ) -> U128 {
        let (used_amount, burned_amount) =
            self.token.internal_ft_resolve_transfer(&sender_id, receiver_id, amount);
        if burned_amount > 0 {
            log!("Account @{} burned {}", sender_id, burned_amount);
        }
        used_amount.into()
    }
}

#[near]
impl StorageManagement for Contract {
    #[payable]
    fn storage_deposit(
        &mut self,
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance {
        self.token.storage_deposit(account_id, registration_only)
    }

    #[payable]
    fn storage_withdraw(&mut self, amount: Option<NearToken>) -> StorageBalance {
        self.token.storage_withdraw(amount)
    }

    #[payable]
    fn storage_unregister(&mut self, force: Option<bool>) -> bool {
        if let Some((account_id, balance)) = self.token.internal_storage_unregister(force) {
            log!("Closed @{} with {}", account_id, balance);
            true
        } else {
            false
        }
    }

    fn storage_balance_bounds(&self) -> StorageBalanceBounds {
        self.token.storage_balance_bounds()
    }

    fn storage_balance_of(&self, account_id: AccountId) -> Option<StorageBalance> {
        self.token.storage_balance_of(account_id)
    }
}

#[near]
impl FungibleTokenMetadataProvider for Contract {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().unwrap()
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    use super::*;

    fn context(predecessor: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor.clone())
            .predecessor_account_id(predecessor);
        builder
    }

    #[test]
    fn new_sets_metadata_and_zero_supply() {
        let ctx = context(accounts(1));
        testing_env!(ctx.build());
        let contract = Contract::new(accounts(1));
        let metadata = contract.ft_metadata();
        assert_eq!(metadata.name, "Test USDT");
        assert_eq!(metadata.symbol, "USDT");
        assert_eq!(metadata.decimals, 6);
        assert_eq!(contract.ft_total_supply().0, 0);
        assert_eq!(contract.get_owner_id(), accounts(1));
    }

    #[test]
    fn owner_can_mint() {
        let mut ctx = context(accounts(1));
        testing_env!(ctx.build());
        let mut contract = Contract::new(accounts(1));
        contract.mint(accounts(2), U128(1_000_000));
        testing_env!(ctx.is_view(true).build());
        assert_eq!(contract.ft_balance_of(accounts(2)).0, 1_000_000);
        assert_eq!(contract.ft_total_supply().0, 1_000_000);
    }

    #[test]
    #[should_panic(expected = "Only the owner can mint")]
    fn other_account_cannot_mint() {
        let mut ctx = context(accounts(1));
        testing_env!(ctx.build());
        let mut contract = Contract::new(accounts(1));
        testing_env!(ctx.predecessor_account_id(accounts(2)).build());
        contract.mint(accounts(2), U128(1));
    }
}
