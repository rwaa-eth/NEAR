//! Escrow for one NEP-141 token. Deposits for an email hash sit in one vector.
//! Release pays that vector out in a single transfer. Reclaim removes one
//! deposit by swapping it with the last entry and popping.
use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
use near_sdk::borsh::BorshSerialize;
use near_sdk::collections::LookupMap;
use near_sdk::json_types::{U64, U128};
use near_sdk::{
    env, ext_contract, log, near, require, AccountId, BorshStorageKey, Gas, NearToken,
    PanicOnDefault, Promise, PromiseOrValue,
};

const CLAIM_PERIOD_NS: u64 = 7 * 24 * 60 * 60 * 1_000_000_000;
const GAS_FOR_FT_TRANSFER: Gas = Gas::from_tgas(15);
const GAS_FOR_CALLBACK: Gas = Gas::from_tgas(10);
const ONE_YOCTO: NearToken = NearToken::from_yoctonear(1);

#[derive(Clone)]
#[near(serializers = [borsh, json])]
pub struct Deposit {
    pub id: u64,
    pub from: AccountId,
    pub amount: U128,
    pub unlock_at_ns: U64,
}

#[derive(PanicOnDefault)]
#[near(contract_state)]
pub struct Contract {
    owner_id: AccountId,
    token_id: AccountId,
    next_deposit_id: u64,
    deposits: LookupMap<[u8; 32], Vec<Deposit>>,
}

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
enum StorageKey {
    Deposits,
}

#[near]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId, token_id: AccountId) -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self {
            owner_id,
            token_id,
            next_deposit_id: 0,
            deposits: LookupMap::new(StorageKey::Deposits),
        }
    }

    pub fn get_owner_id(&self) -> AccountId {
        self.owner_id.clone()
    }

    pub fn get_token_id(&self) -> AccountId {
        self.token_id.clone()
    }

    /// Open deposits for an email hash. `email_hash` is 64 hex characters, optionally `0x`-prefixed.
    pub fn get_deposits(&self, email_hash: String) -> Vec<Deposit> {
        self.deposits.get(&parse_hash(&email_hash)).unwrap_or_default()
    }

    /// Pay every open deposit for this hash to `receiver_id`. Owner only.
    pub fn release(&mut self, email_hash: String, receiver_id: AccountId) -> Promise {
        require!(env::predecessor_account_id() == self.owner_id, "Only the owner can release");
        let hash = parse_hash(&email_hash);
        let rows = self.take_all(&hash);
        self.send(hash, rows, receiver_id)
    }

    /// After the claim period, the original payer takes one deposit back.
    pub fn reclaim(&mut self, email_hash: String, deposit_id: u64) -> Promise {
        let hash = parse_hash(&email_hash);
        let row = self.take_one(&hash, deposit_id);
        let payer = row.from.clone();
        self.send(hash, vec![row], payer)
    }
}

#[near]
impl FungibleTokenReceiver for Contract {
    /// `msg` is the email hash, 64 hex characters. The token contract is the only allowed caller.
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        require!(env::predecessor_account_id() == self.token_id, "Only the token contract can deposit");
        require!(amount.0 > 0, "Deposit amount must be positive");
        let hash = parse_hash(&msg);
        let mut rows = self.deposits.get(&hash).unwrap_or_default();
        let deposit = Deposit {
            id: self.next_deposit_id,
            from: sender_id,
            amount,
            unlock_at_ns: U64(env::block_timestamp() + CLAIM_PERIOD_NS),
        };
        self.next_deposit_id += 1;
        log!(
            "deposited id={} hash={} from={} amount={} unlock_at_ns={}",
            deposit.id,
            hex_encode(&hash),
            deposit.from,
            deposit.amount.0,
            deposit.unlock_at_ns.0
        );
        rows.push(deposit);
        self.deposits.insert(&hash, &rows);
        PromiseOrValue::Value(U128(0))
    }
}

#[near]
impl Contract {
    #[private]
    pub fn on_transfer(
        &mut self,
        email_hash: String,
        deposits: Vec<Deposit>,
        receiver_id: AccountId,
    ) {
        let hash = parse_hash(&email_hash);
        let paid = env::promise_results_count() == 1
            && matches!(env::promise_result_checked(0, 1024), Ok(_));
        if paid {
            for deposit in &deposits {
                log!(
                    "paid id={} hash={} to={} amount={}",
                    deposit.id,
                    email_hash,
                    receiver_id,
                    deposit.amount.0
                );
            }
            return;
        }
        self.put_back(&hash, deposits);
        log!("transfer failed, deposits restored for {}", email_hash);
    }
}

impl Contract {
    fn take_all(&mut self, email_hash: &[u8; 32]) -> Vec<Deposit> {
        let rows = self.deposits.remove(email_hash).unwrap_or_default();
        require!(!rows.is_empty(), "Nothing pending");
        rows
    }

    fn take_one(&mut self, email_hash: &[u8; 32], deposit_id: u64) -> Deposit {
        let mut rows = self.deposits.get(email_hash).unwrap_or_else(|| env::panic_str("Nothing pending"));
        let index = rows
            .iter()
            .position(|row| row.id == deposit_id)
            .unwrap_or_else(|| env::panic_str("Deposit not found"));
        let payer = env::predecessor_account_id();
        require!(rows[index].from == payer, "Only the payer can reclaim");
        require!(
            env::block_timestamp() >= rows[index].unlock_at_ns.0,
            "Still locked"
        );
        let last = rows.len() - 1;
        rows.swap(index, last);
        let taken = rows.pop().unwrap();
        if rows.is_empty() {
            self.deposits.remove(email_hash);
        } else {
            self.deposits.insert(email_hash, &rows);
        }
        taken
    }

    fn put_back(&mut self, email_hash: &[u8; 32], mut returned: Vec<Deposit>) {
        if returned.is_empty() {
            return;
        }
        match self.deposits.get(email_hash) {
            Some(mut rows) => {
                rows.append(&mut returned);
                self.deposits.insert(email_hash, &rows);
            }
            None => {
                self.deposits.insert(email_hash, &returned);
            }
        }
    }

    fn send(&self, email_hash: [u8; 32], deposits: Vec<Deposit>, receiver_id: AccountId) -> Promise {
        let amount = deposits.iter().fold(0u128, |sum, deposit| {
            sum.checked_add(deposit.amount.0).unwrap_or_else(|| env::panic_str("Amount overflow"))
        });
        let hash = hex_encode(&email_hash);
        ext_ft::ext(self.token_id.clone())
            .with_static_gas(GAS_FOR_FT_TRANSFER)
            .with_attached_deposit(ONE_YOCTO)
            .ft_transfer(receiver_id.clone(), U128(amount), None)
            .then(
                ext_self::ext(env::current_account_id())
                    .with_static_gas(GAS_FOR_CALLBACK)
                    .on_transfer(hash, deposits, receiver_id),
            )
    }
}

#[allow(dead_code)]
#[ext_contract(ext_ft)]
trait ExtFungibleToken {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
}

#[allow(dead_code)]
#[ext_contract(ext_self)]
trait ExtSelf {
    fn on_transfer(&mut self, email_hash: String, deposits: Vec<Deposit>, receiver_id: AccountId);
}

fn parse_hash(text: &str) -> [u8; 32] {
    let text = text.trim().strip_prefix("0x").unwrap_or(text.trim());
    require!(text.len() == 64, "Email hash must be 64 hex characters");
    let mut out = [0u8; 32];
    for (i, byte) in out.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&text[i * 2..i * 2 + 2], 16)
            .unwrap_or_else(|_| env::panic_str("Email hash must be hex"));
    }
    out
}

fn hex_encode(bytes: &[u8; 32]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(64);
    for byte in bytes {
        out.push(HEX[(byte >> 4) as usize] as char);
        out.push(HEX[(byte & 0x0f) as usize] as char);
    }
    out
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    use super::*;

    const HASH: &str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    fn context(predecessor: AccountId, timestamp: u64) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor.clone())
            .predecessor_account_id(predecessor)
            .block_timestamp(timestamp);
        builder
    }

    fn contract() -> Contract {
        testing_env!(context(accounts(1), 1_000).build());
        Contract::new(accounts(2), accounts(1))
    }

    fn deposit(contract: &mut Contract, from: AccountId, amount: u128) {
        testing_env!(context(accounts(1), 1_000).build());
        contract.ft_on_transfer(from, U128(amount), HASH.to_string());
    }

    #[test]
    fn deposits_append_for_one_hash() {
        let mut contract = contract();
        deposit(&mut contract, accounts(3), 5);
        deposit(&mut contract, accounts(4), 7);
        let rows = contract.get_deposits(HASH.to_string());
        assert_eq!(rows.len(), 2);
        assert_eq!(rows[0].id, 0);
        assert_eq!(rows[0].from, accounts(3));
        assert_eq!(rows[1].id, 1);
        assert_eq!(rows[1].amount.0, 7);
        assert_eq!(rows[0].unlock_at_ns.0, 1_000 + CLAIM_PERIOD_NS);
    }

    #[test]
    #[should_panic(expected = "Only the token contract can deposit")]
    fn stranger_cannot_deposit() {
        let mut contract = contract();
        testing_env!(context(accounts(3), 1_000).build());
        contract.ft_on_transfer(accounts(3), U128(1), HASH.to_string());
    }

    #[test]
    fn reclaim_swaps_the_middle_entry_and_pops_it() {
        let mut contract = contract();
        deposit(&mut contract, accounts(3), 5);
        deposit(&mut contract, accounts(4), 7);
        deposit(&mut contract, accounts(5), 9);
        testing_env!(context(accounts(4), 1_000 + CLAIM_PERIOD_NS).build());
        let taken = contract.take_one(&parse_hash(HASH), 1);
        assert_eq!(taken.from, accounts(4));
        assert_eq!(taken.amount.0, 7);
        let rows = contract.get_deposits(HASH.to_string());
        assert_eq!(rows.len(), 2);
        assert_eq!(rows.iter().map(|row| row.id).collect::<Vec<_>>(), vec![0, 2]);
    }

    #[test]
    fn reclaim_removes_the_hash_when_it_was_the_last_deposit() {
        let mut contract = contract();
        deposit(&mut contract, accounts(3), 5);
        testing_env!(context(accounts(3), 1_000 + CLAIM_PERIOD_NS).build());
        contract.take_one(&parse_hash(HASH), 0);
        assert!(contract.get_deposits(HASH.to_string()).is_empty());
    }

    #[test]
    #[should_panic(expected = "Still locked")]
    fn reclaim_is_locked_until_the_claim_period() {
        let mut contract = contract();
        deposit(&mut contract, accounts(3), 5);
        testing_env!(context(accounts(3), 1_000).build());
        contract.take_one(&parse_hash(HASH), 0);
    }

    #[test]
    fn release_takes_every_row_for_the_hash() {
        let mut contract = contract();
        deposit(&mut contract, accounts(3), 5);
        deposit(&mut contract, accounts(4), 7);
        let rows = contract.take_all(&parse_hash(HASH));
        assert_eq!(rows.len(), 2);
        assert!(contract.get_deposits(HASH.to_string()).is_empty());
    }

    #[test]
    fn failed_transfer_puts_the_rows_back() {
        let mut contract = contract();
        deposit(&mut contract, accounts(3), 5);
        let rows = contract.take_all(&parse_hash(HASH));
        contract.put_back(&parse_hash(HASH), rows);
        assert_eq!(contract.get_deposits(HASH.to_string()).len(), 1);
    }
}
