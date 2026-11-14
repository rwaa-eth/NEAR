# Coding log

This is my log of changes made after watching people use the wallet, with a few facepalm moments.

## One page could not hold the whole wallet

Initially we put everything on the first page, assuming that it would be simpler if everything is is on there - receive, history, and send were stacked together. It was too busy and confusing.

The wallet is now two pages. Balance and history on the first page, with a send button to take you to the page dedicated to send.

## The first completed sends

Once a payment actually went from one wallet to another, two holes showed up.

Sending to an email left a history row. Sending to an address, including a scanned QR, moved the balance and left no row. A return payment of 1 USDT updated both balances and still did not appear under the original entry. Address payments are now recorded the same way as email payments, so each side sees the transfer.

The address also had a text Copy button. On a phone it was covered by the surrounding layout. Copy is now an icon beside the ADDRESS label.

## The ATM bridge

The auto-bridge was added so a NEAR wallet could pay an Ethereum address at the Paka ATM. We tested it and all seemed ok, within certain limitations. The first send of 0.5 USDT took about 5 minutes, but the second test took 8 hrs. After digging a bit we determined that it's probably the low amount so we put a limit of 10 USDT minimum.

The next surprise (which probably shouldn't have been) was that the ATM used EIP681 format send addresses. We scanned the code and sent the required values to the operator so they could complete the transaction.

Then the next issue hit, which was pretty obvious in hindsight. After sending the correct amount the user got a mysterious 'transaction failed' email with no explanation. After tracing the transaction through the bridge the reason jumped out - the bridge takes its fee from the USDT balance.

After inspecting the flash forwarder USDT receiver contract instance, we could see that it should be possible to send the remainder if we were quick - so we sent the USDT directly, which after a couple of minutes caused the machine to finally spit out the MXN pesos! Success.

## Cash-out instructions

The successful withdrawal also showed that the written ATM steps were too much to follow at the machine. The cash-out guide is now a short picture story, one step at a time, in Spanish for a Latin American visitor and in English otherwise. It is opened from the Cash button on the wallet page and on the send page.

## Some random observations from an Ethereum perspective of using NEAR

- Built in account naming is a great design choice!
- tx fees are pretty good.
- RPC access is not quite at the same level as ethereum.
- The design philosophy seems pretty sound and should help avoid the scaling issues that have plagued ethereum (and only just really starting to be solved, but we all avoid actually using etherum mainnet and are surprised when it doesn't cost the equivalent of a coffee to deploy a contract).