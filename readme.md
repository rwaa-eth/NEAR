# RWAA system spec

A person creates one passkey. That passkey is a NEAR account. The account is bound to one walked lot boundary. The same account sends and receives NEAR in the Android app and in the web wallet. Neighbours attest shared edges, and the account’s payment history is exported as a checkable audit pack a lender can use beside its own credit process.

Domain: `rwaa.percolate.one`. Android package: `one.percolate.rwaa`.

## 1. Parts


| Part         | Job                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Android app  | Create the passkey, walk or edit the lot ring, show nearby lots, attest a neighbour, send and receive NEAR.                    |
| Web wallet   | Same passkey, same account, same send and receive actions, served by the server.                                               |
| Server       | Serve the wallet pages, verify passkey signatures, store lot revisions and attestations, index payments, build the audit pack. |
| NEAR account | The passkey’s P-256 key. Account id is derived from that key. Payments and anchored statements live here.                      |


The server never holds a signing key for the user. It verifies WebAuthn assertions and can relay a transaction the user has already signed.

## 2. Identity

Creating a passkey on the phone or on the site uses the same relying party id, `rwaa.percolate.one`. Digital Asset Links let the Android app and the site share that credential. User verification is required.

The credential’s P-256 public key is compressed and turned into a deterministic NEAR account id through the state-init hash used by `p256-passkey-wallet-contract.trezu.near`. The id looks like `0s` plus 20 bytes of hex. The same public key always yields the same account id, on the phone and on the web.

Registration stores the credential id, COSE public key, compressed key, NEAR public-key string, account id, and signature counter. A relayer may submit account init. The account id is valid before that transaction lands.

Every later API call, except registration and the public pages, carries a passkey assertion. The challenge is bound to the HTTP method, the path, and the hash of the body, so a captured assertion cannot be replayed against a different request. The same binding is what the web wallet and the app already use.

## 3. One account, one lot

A lot is a closed ring of `[longitude, latitude]` points. The ring has at least three distinct points, does not cross itself, and repeats the first point at the end. The app collects it in two ways:

- Walk. Fixes coarser than 10 m are dropped. Points closer than 4 m to the previous point are dropped. The ring closes when the walker returns to within 3 m of the start after at least 8 m of path.
- Map edit. Vertices can be moved, inserted, and deleted. Save still requires a closed, non-crossing ring.

Saving sends `POST /v1/parcels` under the passkey. The server stores the ring, its bounding box, and the owner account id. The lot’s home point is the ring centroid, with a 150 m presence radius.

Product rule: one active lot per account. The first save creates it. A later save from the same account is a new revision of that lot, not a second lot. Each revision stores the full ring and a `geometry_rev`, the SHA-256 of the canonical ring. Canonical form is counter-clockwise, closed, and serialized with stable key order and coordinates as signed decimal degrees.

The passkey account is the lot’s payment address for as long as that revision is active. The binding is the pair `(account id, lot id)`. Payments stay on the account forever. If the person later releases the lot, the audit pack still shows which revision was bound during which interval. Payment history does not move to a new passkey.

## 4. Shared wallet

The app and the web wallet expose the same actions on the same account. There is no second balance and no custodial ledger.


| Action   | What the person sees                          | What happens                                                                                                                                                       |
| -------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Account  | Account id and a copyable receive string.     | Read the account derived at registration.                                                                                                                          |
| Balance  | NEAR balance of that account.                 | Read NEAR RPC.                                                                                                                                                     |
| Receive  | Account id and a QR code of it.               | No transaction.                                                                                                                                                    |
| Activity | Incoming and outgoing payments, newest first. | Read the server index, which is filled from NEAR. Each row links to the transaction hash.                                                                          |
| Send     | Recipient account, amount, optional memo.     | The passkey signs a payload that commits to recipient, amount, token, and memo. A relayer submits that signed action. The relayer cannot change those four fields. |
| Lot      | The ring, revision, and trust grade.          | Read `GET /v1/lots/mine`.                                                                                                                                          |


Send supports native NEAR first. A later token uses the same screen with a token field. The app and the site share field names, validation, and error text: unknown account, insufficient balance, passkey cancelled, relayer rejected, transaction expired.

Until the account holds enough NEAR to pay gas, the relayer sponsors gas. After it does, the account pays its own gas. Sponsorship never extends to choosing the recipient or the amount.

The web wallet is the page at `/`. It replaces the current login-only page. Sign-in is the passkey assertion. After sign-in the page shows balance, receive, send, activity, and the linked lot. The app’s wallet screen is the same five blocks.

## 5. Server

The server is the Fastify process already in `server/`. It serves:

- `/` and the wallet script, the web wallet.
- `/.well-known/assetlinks.json`, so the app can use the site passkey.
- `/v1/*`, the signed API.

It keeps SQLite records for credentials, challenges, lot revisions, presence samples, neighbour relations, attestations, and a payment index. NEAR remains the source of truth for transfers. The index is a cache plus the memo and lot revision the UI needs.

Public routes stay limited to the wallet pages, the wallet script, and asset links. Everything else requires the static bearer token and, after registration, the passkey assertion.

### Lot log

`POST /v1/parcels` writes a revision, as it does now, and refuses a second active lot id for the account. The response adds `geometryRev` and `trust`.

`GET /v1/parcels/nearby?lat&lng&radiusM` returns lots whose ring or centroid falls in the radius. Each item includes `id`, `owner`, `ring`, `geometryRev`, `trust`, and `owned`. Owners are visible because a neighbour has to know which account they are attesting. Account ids are already public once the account is used on NEAR.

`GET /v1/lots/mine` returns the caller’s active revision, trust grade, edge list, and open conflicts.

`POST /v1/lots/release` marks the active binding ended. The revision history remains. A release is signed by the current passkey.

Presence stays `POST /v1/presence`. Samples are `home`, `away`, or `inconclusive`. A fix coarser than 300 m is inconclusive. Raw samples are not part of the default audit pack.

## 6. Web of trust

A lot starts as a self-asserted ring. It becomes stronger when each shared edge is recognised by the account on the other side. Recognition is a signed statement, not a vote by the server.

### Neighbours and conflicts

After every save the server compares the new ring with lots in the surrounding area.

Two rings **conflict** when their interiors overlap by more than 1 m². A conflict blocks a reinforced grade for both lots on the overlapping area. Either party can clear it by publishing a revised ring that no longer overlaps. The conflict record keeps both revisions.

Two rings are **neighbours** when they do not conflict and at least one pair of edges runs within 5 m of each other for at least 8 m. Those matched stretches are the shared edges. The tolerance sits inside the walker’s accuracy gate, so two honest walks of the same fence can still meet.

Each shared edge has an `edge_hash`: SHA-256 of the shared polyline, coordinates rounded to 1e-7 degrees, direction normalised so both neighbours hash the same bytes.

An edge with no neighbour is **open**. Roads, water, and the outer side of a group of lots are open. The owner may mark an edge open. A later neighbour whose ring matches that edge clears the open mark and requires an attestation.

### Attestation

An attestation is one direction across one shared edge.

```json
{
  "v": 1,
  "attester": "<account id>",
  "subject": "<account id>",
  "attesterLotId": "<uuid>",
  "subjectLotId": "<uuid>",
  "attesterRev": "<geometry_rev>",
  "subjectRev": "<geometry_rev>",
  "edgeHash": "<hex>",
  "statement": "recognise-boundary",
  "issuedAt": "<ISO-8601>"
}
```

`POST /v1/attestations` accepts that body. The passkey assertion must belong to `attester`, and that account must own `attesterLotId` at `attesterRev`. The server checks that `edgeHash` is still a shared edge of the two current revisions. A second attestation of the same edge by the same attester replaces the previous one.

`DELETE /v1/attestations/:id` revokes it. The row stays, with `revokedAt` set.

Editing a ring bumps `geometryRev`. Attestations that name the old revision become **void**. They remain in the log and no longer count. The neighbours see the edge return to unrecognised until they sign again.

### Grades


| Grade        | Meaning                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| `claimed`    | Saved ring. No mutual edge yet.                                                                         |
| `partial`    | At least one shared edge has attestations both ways, and no interior conflict.                          |
| `reinforced` | Every edge is either mutual or explicitly open, and there is no interior conflict.                      |
| `contested`  | An interior overlap is open, or an attestation names a different edge than the current shared geometry. |
| `released`   | The account signed a release. The revision history stays.                                               |


Mutual means A’s attestation and B’s attestation cite the same `edgeHash` and each other’s current revisions, and neither is revoked or void.

Reinforced ownership in this system means the neighbouring accounts agree on the shared lines and the ring does not collide with another claim. It is a public, checkable occupancy consensus. A government cadastre, a survey plan, and a title register are outside this system. The wallet UI says “neighbours agree on these edges” and shows the grade. It does not say the person holds legal title.

### What a third party can recompute

Trust does not depend on trusting the server’s word. A verifier needs:

- the lot revisions and their hashes,
- the attestation bodies,
- the WebAuthn signatures over those requests,
- the two public keys, which are on the credentials the server published at registration and which match the NEAR accounts.

The verifier rebuilds neighbour edges from the rings and checks that the signatures match the attesters. The server is a log and a map. The signatures are the support.

A later step anchors `edgeHash` and `geometryRev` in a NEAR receipt signed by the attester’s passkey, using the same send path as a payment. After that, the receipt is a second copy of the statement. Until that receipt exists, the passkey-signed API record is the statement.

## 7. Payment audit trail

Every payment into or out of the lot account is already on NEAR. The server indexes those transactions for the account: hash, direction, counterparty, amount, token, block time, memo, and the lot revision that was active at that block time. The index is rebuilt from RPC if the database is lost.

The person can export an **audit pack** for a date range. `POST /v1/audit/export` returns a canonical JSON document. The holder then signs the pack hash with the passkey. The signature is stored with the pack and returned to the client. A bank, or anyone else, can check the signature against the account’s public key and check each payment row against NEAR.

### Pack contents

1. Account id, lot id, geometry hash, trust grade, and the revision interval covered.
2. Each payment: transaction hash, time, direction, counterparty, amount, token, memo.
3. Figures computed from those rows: first and last payment time, number of counterparties, inflow count and sum by month, median inflow, longest gap between inflows, balance at the end of the range.
4. Support summary: mutual edges over total edges, attester account ids, open conflicts.
5. Optional occupancy line, only if the holder ticks it: number of distinct days with a `home` sample in the range. Raw coordinates stay out of the pack.
6. The pack hash and the holder’s passkey signature over it.

Memos are short labels the sender attaches at send time, such as an invoice id or “rent”. They ride inside the signed payload. The index shows them beside the transaction so a reader can group payments without a private ledger.

### How a lender uses it

The pack is evidence the lender can verify: this account received these payments, from these counterparties, while it was bound to this lot, and these neighbours had signed the boundary. The lender applies its own policy. RWAA does not emit a credit score, a default probability, or a regulated credit file. The product’s job is to make the on-chain history and the lot grade portable and checkable.

Location samples are the holder’s to include or leave out. The default pack has no coordinates.

## 8. API added by this spec

Existing routes stay: challenge, register, session, credential, parcels, nearby, presence.


| Method   | Path                   | Purpose                                                                              |
| -------- | ---------------------- | ------------------------------------------------------------------------------------ |
| `GET`    | `/v1/lots/mine`        | Active lot, revisions, edges, grade.                                                 |
| `POST`   | `/v1/lots/release`     | End the active binding.                                                              |
| `GET`    | `/v1/lots/:id/edges`   | Shared, open, and conflicting edges for a lot.                                       |
| `POST`   | `/v1/attestations`     | Sign a shared edge.                                                                  |
| `DELETE` | `/v1/attestations/:id` | Revoke one.                                                                          |
| `GET`    | `/v1/wallet/activity`  | Indexed payments for the caller.                                                     |
| `POST`   | `/v1/wallet/relay`     | Submit a passkey-signed NEAR action. Body commits to recipient, amount, token, memo. |
| `POST`   | `/v1/audit/export`     | Build the pack for a range.                                                          |
| `POST`   | `/v1/audit/sign`       | Store the holder’s signature over the pack hash.                                     |


`/v1/parcels/nearby` gains `owner`, `geometryRev`, and `trust`.

Wallet balance and transaction status come from NEAR RPC. The server does not proxy balance as an authority.

## 9. Records

New tables, beside the current credentials, challenges, parcels, homes, and presence samples:

- `lot_revisions` — lot id, account id, ring, geometry rev, created time, superseded time.
- `lot_bindings` — account id, lot id, started time, ended time.
- `edge_relations` — the two lot revisions, edge hash, kind (`shared`, `open`, `conflict`), computed time.
- `attestations` — the statement fields above, signature bytes, revoked time, voided time.
- `payments` — account id, tx hash, direction, counterparty, amount, token, memo, block time, lot revision.
- `audit_packs` — pack hash, range, document, holder signature, created time.

`parcels` remains the current ring for map queries. A save appends a `lot_revisions` row and updates `parcels` in the same transaction.

## 10. Flows

**Create account and lot.** The person creates the passkey in the app. The app registers it and shows the account id. They walk the boundary or edit it on the map, then save. The server opens the binding and computes neighbour edges. The web wallet, opened on `rwaa.percolate.one` with the same passkey, shows the same account, balance, and lot.

**Receive and send.** Someone pays the account id. The next activity refresh shows the incoming transfer. The holder sends from either the app or the site. Both build the same payload, both prompt the same passkey, and both show the same transaction hash.

**Neighbour support.** Two adjacent lots are saved. Each owner opens the nearby lot, sees the highlighted shared edge, and attests. When the second signature lands, that edge becomes mutual. When every edge is mutual or open, the grade becomes reinforced. If one owner drags a vertex, the grade drops and both are asked to attest the new edge.

**Hand a pack to a lender.** The holder picks a range, exports, and signs. They give the file to the lender. The lender checks the passkey signature and replays the transaction hashes on NEAR. The lot grade in the file matches the attestations listed in it.

## 11. Limits

- GPS rings are sketches at the accuracy of the phone. The 5 m neighbour tolerance is there so two walks of one fence can agree. It is not a survey.
- A reinforced grade is neighbour agreement plus absence of an overlapping claim. It does not replace a land registry.
- The audit pack is a signed extract of public NEAR payments plus the lot log. It does not assert income, identity documents, or creditworthiness.
- NEAR transfers are public. The pack does not add privacy to the chain. It only keeps GPS tracks out unless the holder opts in.
- The server log can be unavailable. Payments can still be read from NEAR. Attestations can be checked from the signed records the parties kept, and from NEAR once anchoring is on.



## 12. Build order

1. **Already in the tree.** Passkey registration, assertion-bound API, deterministic account id, parcel save, nearby query, presence, Android walk and map edit, login page on the server.
2. **Wallet.** One account per lot, revision log, `/` becomes the wallet, the app gains the same send, receive, and activity blocks, relayer submits the signed payment.
3. **Trust.** Neighbour and conflict computation on save, attestation routes, grades on the map in both clients.
4. **Audit.** Payment indexer, export, passkey signature over the pack, optional occupancy line.
5. **Anchor.** Attestations also published as NEAR receipts from the attester account.

## 13. Additional project involvement

DaiKyuKim is also involved in the AMUMA submission.

