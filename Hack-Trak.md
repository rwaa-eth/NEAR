# Hack track

Real-World Money (`realworld`). Deadline 14 Nov 2026, 23:59 UTC (10:59 on 15 Nov, UTC+11).

A person with an email, a mobile number, or a lot they walked can be paid a NEAR stablecoin before they have a wallet, hold it, pay it out, and point at a transaction hash.

## 2–5 Nov — Contract

- [x] Deploy the NEP-141 test stablecoin on NEAR testnet
- [x] Deploy the handle escrow (`email:`, `phone:`, `OSM ID:`)
- [x] Deposit via `ft_transfer_call` works from a script
- [x] script minting
- [ ] Implement gas station
- [ ] agree on field deployment test

## 6–8 Nov — Page

- [x] Pending deposit shows a transaction hash and the escrow timeout
- [ ] NEAR wallet page
- [x] Collect after email verification and passkey creation
- [x] Payout shows an outgoing row and a hash
- [ ] Test Reclaim functionality
- [ ] Gas is sponsored on release and payout
- [ ] Dry run of the field script on two phones

## 9–12 Nov — History and field course

- [ ] Reclaim of an uncollected deposit
- [ ] CSV dump of the transaction history a bookkeeper can open or link to account on NEAR blocks
- [ ] Instructions on how to reclaim, send, collect etc
- [ ] Screen demo recorded
- [ ] Mexico session: create passkey, get paid, collect, pay a small amount back, walk the lot, keep the history
- [ ] Ghana session: same script
- [ ] Walked lot id stored on the account as `lot:`
- [ ] Note from each session: which handle they would give someone who owes them money

## 13–14 Nov — Publish

- [ ] Repository is public
- [ ] Demo post on X, published by us, with the video, @NEARProtocol and #NEARHackathon
- [ ] Submission payload checked, then sent
- [ ] Feature work stopped
