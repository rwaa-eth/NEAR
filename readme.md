# RaOpenwallet

Two web wallets. An email address is the account a person remembers. Each wallet process serves one chain and one network, with its own host, passkey relying party, and database.

| Process | Chain | Host | Port |
| --- | --- | --- | --- |
| `near-server` | NEAR testnet | `test-near.raopenwallet.org` | 8099 |
| `near-server` | NEAR mainnet | `raopenwallet.org` | 8099 |
| `server` | Base Sepolia | `test-evm.raopenwallet.org` | 8098 |
| `server` | Base | a second process, its own host | 8098 |

Mainnet and testnet are separate processes. They do not share a SQLite file or a passkey relying party. A passkey created on one host does not open the other.

## NEAR wallet

`near-server` is a Fastify app. It serves the wallet pages and a small API. The browser signs NEAR transactions with a key it keeps locally. The server stores the email-to-account map, the payment index, and the operator key used to pay gas.

### Account

Signup asks for an email, sends a one-time code, and asks for an invite code. A person who already has USDT waiting in escrow can open the wallet without an invite.

The browser generates an ed25519 key and keeps it in local storage. The NEAR account id is the implicit account: the public key as 64 hex characters. No `.near` name is registered. The same public key always yields the same account id.

The operator account sends a little NEAR when the account is created, and tops it up when a send would otherwise run out of gas. That NEAR pays fees. It does not choose the recipient or the amount. A passkey prompt confirms the send. The passkey is not the chain key.

### Pages

`/` is the wallet: balance, receive QR, history, payments waiting to be collected, and payments waiting on the recipient. `/send` is the send form. Back returns home. `/invite` issues signup codes. `/devcheck` reads a balance and the escrow rows for an account.

### Send

The recipient is an email, a NEAR account id, an Ethereum address, or a `.eth` name.

- A registered email is paid with `ft_transfer` on the configured NEP-141 token.
- An email with no wallet is paid into the escrow contract, keyed by the hash of the email. The recipient collects it after opening a wallet. After one week the sender can pull that deposit back.
- A NEAR account id is paid directly. The server records the transfer so both wallets show it in history, including when the other side has not registered that address as an email.
- An Ethereum address or ENS name, on the mainnet process only, is a bridge. See below.

History, incoming escrow, and outgoing escrow live in SQLite. NEAR is the source of the transfer. The index is what the page lists.

### Bridge

Mainnet USDT (`usdt.tether-token.near`) can be sent to an Ethereum USDT address through NEAR Intents. The server asks the 1Click API for a quote and returns the NEAR transactions the browser must sign. The browser signs them with the wallet key.

An EIP-681 payment QR fills the Ethereum address, the exact amount the recipient must receive, and the payment id. The quoted bridge fee is added on top of that amount, and the page shows the fee beside the amount. The quote is refreshed on a two-minute timer while the send page is open. The minimum bridge is 10 USDT.

The Cash button opens a step-by-step picture guide for a Paka ATM withdrawal. A visitor whose IP is in Latin America sees the Spanish steps. Everyone else sees the English steps.

## Base wallet

`server` is the same shape of app on Base. Signup verifies the email, then creates a passkey. The passkey's P-256 key is the EVM account. Sends and escrow releases are confirmed with that passkey.

`EVM_NETWORK=testnet` is Base Sepolia (chain 84532). `EVM_NETWORK=mainnet` is Base (chain 8453). The token is an ERC-20 deployed for the testnet process. Unregistered emails are paid through the Solidity escrow, and the operator key submits the release when the recipient collects.

## Contracts

| Contract | Where | Role |
| --- | --- | --- |
| `contracts/test-usdt` | NEAR | NEP-141 with 6 decimals. The deploying account is the only minter. Used on testnet. Mainnet sends `usdt.tether-token.near`. |
| `contracts/near-escrow` | NEAR | Holds one NEP-141. Deposits are stored under the recipient email hash and released in one transfer. A deposit can be reclaimed by the sender after seven days. |
| `server` Solidity | Base | Test ERC-20 and the email escrow used by the Base wallet. |

`near-deploy` creates the operator's implicit account and deploys the NEAR escrow. From `near-server`, `npm run fund -- account.testnet 1000` mints test USDT, and `npm run signup-key` issues an invite code.

## Run

```bash
cd near-server
npm install
npm run dev
```

The NEAR wallet is at `http://127.0.0.1:8099/`. Copy `.env.example` to `.env` first. The Base wallet is the same steps in `server/`, on port 8098.

`npm test` in each app runs the API tests. `npm run build:wallet` in `near-server` rebuilds `public/wallet.js` after a client change. HTML is read from disk on each request. A change under `src/` needs a restart of the process.

## What stays off the server

The user's NEAR secret key and the Base passkey private key stay in the browser. The server has the operator key, the email login, and the SQLite index. Losing the database does not move the tokens. It does drop the email-to-account map and the history index until those rows are written again.

The NEAR server still mounts the older lot API (`/v1/parcels`, nearby lots, presence) and the MapLogger Android app is still in the tree. Those are not part of the wallet flow above.

## License

RaOpenwallet is released under the MIT license. See `LICENSE`.
