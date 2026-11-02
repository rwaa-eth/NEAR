# Hack track

Real-World Money (`realworld`). Deadline 14 Nov 2026, 23:59 UTC (10:59 on 15 Nov, UTC+11).

A person with an email, a mobile number, or a lot they walked can be paid a NEAR stablecoin before they have a wallet, hold it, pay it out, and point at a transaction hash.

## 2–5 Nov — Contract

- [ ] Deploy the NEP-141 test stablecoin on NEAR testnet
- [ ] Deploy the handle escrow (`email:`, `phone:`, `lot:`)
- [ ] Deposit via `ft_transfer_call` works from a script
- [ ] Release to a testnet account works from a script
- [ ] Relayer pays gas and cannot change the recipient or the amount
- [ ] 45-minute field script agreed

## 6–8 Nov — Page

- [ ] New page, separate from the Base wallet
- [ ] Pending deposit shows a transaction hash and the reclaim time
- [ ] Collect after email verification and passkey creation
- [ ] Payout shows an outgoing row and a hash
- [ ] Gas is sponsored on release and payout
- [ ] Dry run of the field script on two phones

## 9–12 Nov — History and field course

- [ ] Reclaim of an uncollected deposit
- [ ] CSV dump of the transaction history a bookkeeper can open
- [ ] README written as do this, see that, with the Base wallet named as baseline
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
