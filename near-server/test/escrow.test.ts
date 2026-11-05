import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildApp } from "../src/app";
import { loadConfig } from "../src/config";
import { openDatabase } from "../src/db";
import { depositsFromOutcome, emailHash, paymentsFromOutcome, recordDeposits, recordDirectPayments, transfersFromOutcome } from "../src/escrow";
import { accountIdForEmail, type TxOutcome } from "../src/near";

const escrow = "escrow.testnet";
const sender = "rw1111111111111111.testnet";

function outcome(log: string, failed = false): TxOutcome {
  const status = failed ? { Failure: { ActionError: "failed" } } : { SuccessValue: "" };
  return {
    status,
    transaction: { signer_id: sender, hash: "Hash11111111111111111111111111111111" },
    receipts_outcome: [
      {
        outcome: {
          executor_id: escrow,
          logs: [log],
          status,
        },
      },
    ],
  };
}

function appWith(extra: Record<string, string> = {}) {
  const config = loadConfig({
    ...process.env,
    STATIC_API_TOKEN: "test-token",
    SQLITE_PATH: ":memory:",
    NEAR_PROVISION_ACCOUNTS: "false",
    NEAR_TOKEN_ACCOUNT: "token.testnet",
    NEAR_TOKEN_SYMBOL: "USDT",
    NEAR_ESCROW_ACCOUNT: "",
    NEAR_OPERATOR_ACCOUNT: "",
    NEAR_OPERATOR_KEY: "",
    EMAIL_DEV_MODE: "true",
    RESEND_API_KEY: "",
    SMTP_URL: "",
    ...extra,
  });
  const db = openDatabase(":memory:");
  return { app: buildApp(config, db), db, config };
}

async function registerVerified(app: ReturnType<typeof appWith>["app"], email: string): Promise<string> {
  const sent = await app.inject({ method: "POST", url: "/ethw/api/otp/send", payload: { email } });
  assert.equal(sent.statusCode, 200);
  const verified = await app.inject({
    method: "POST",
    url: "/ethw/api/otp/verify",
    payload: { email, code: sent.json().devCode },
  });
  assert.equal(verified.statusCode, 200);
  const created = await app.inject({
    method: "POST",
    url: "/ethw/api/register",
    payload: {
      email,
      publicKey: "ed25519:11111111111111111111111111111111",
      emailToken: verified.json().emailToken,
    },
  });
  assert.equal(created.statusCode, 200);
  return created.json().accountId as string;
}

describe("NEAR escrow records", () => {
  it("reads a deposit log for the lowercase email", () => {
    const hash = emailHash("Ada@Example.com");
    assert.equal(hash, emailHash("ada@example.com"));
    assert.equal(hash.length, 64);
    const unlockNs = 1_700_000_000n * 1_000_000_000n;
    const parsed = depositsFromOutcome(
      outcome(`deposited id=7 hash=${hash} from=${sender} amount=1500000 unlock_at_ns=${unlockNs}`),
      escrow,
      hash,
    );
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].amount, "1500000");
    assert.equal(parsed[0].from, sender);
    assert.equal(parsed[0].depositId, 7);
    assert.equal(parsed[0].unlockAt, 1_700_000_000);
    assert.equal(depositsFromOutcome(outcome("deposited id=1 hash=aa from=a.testnet amount=1 unlock_at_ns=1", true), escrow, hash).length, 0);
    assert.equal(depositsFromOutcome(outcome(`deposited id=7 hash=${hash} from=${sender} amount=1500000 unlock_at_ns=${unlockNs}`), escrow, emailHash("other@example.com")).length, 0);
    const paid = paymentsFromOutcome(
      outcome(`paid id=7 hash=${hash} to=friend.testnet amount=1500000`),
      escrow,
    );
    assert.equal(paid.length, 1);
    assert.equal(paid[0].to, "friend.testnet");
  });

  it("names an account from the email hash", () => {
    const id = accountIdForEmail("Ada@Example.com", "testnet");
    assert.equal(id, accountIdForEmail("ada@example.com"));
    assert.match(id, /^rw[0-9a-f]{16}\.testnet$/);
    assert.equal(accountIdForEmail("ada@example.com", "mainnet").endsWith(".near"), true);
  });

  it("reads a direct ft_transfer and files it in the recipient history", () => {
    const token = "token.testnet";
    const receiver = "rw2222222222222222.testnet";
    const log = `EVENT_JSON:${JSON.stringify({
      standard: "nep141",
      version: "1.0.0",
      event: "ft_transfer",
      data: [{ old_owner_id: sender, new_owner_id: receiver, amount: "2500000" }],
    })}`;
    const receipt = outcome(log);
    receipt.receipts_outcome![0].outcome!.executor_id = token;
    const parsed = transfersFromOutcome(receipt, token, sender, receiver);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].amount, "2500000");
    assert.equal(transfersFromOutcome(receipt, token, sender, "other.testnet").length, 0);
    const { app, db } = appWith();
    recordDirectPayments(db, [
      {
        recipientEmail: "friend@example.com",
        senderEmail: "ada@example.com",
        senderAddress: sender,
        amount: parsed[0].amount,
        txHash: "Hash33333333333333333333333333333333",
        logIndex: parsed[0].logIndex,
      },
    ]);
    return app
      .inject({ method: "GET", url: "/ethw/api/escrow?email=friend@example.com" })
      .then(async (incoming) => {
        assert.equal(incoming.json().incoming.length, 0);
        assert.equal(incoming.json().history.length, 1);
        assert.equal(incoming.json().history[0].senderEmail, "ada@example.com");
        assert.equal(incoming.json().history[0].amount, "2500000");
        assert.equal(incoming.json().history[0].direction, "in");
        const sent = await app.inject({ method: "GET", url: "/ethw/api/escrow?email=ada@example.com" });
        assert.equal(sent.json().outgoing.length, 0);
        assert.equal(sent.json().history.length, 1);
        assert.equal(sent.json().history[0].direction, "out");
        assert.equal(sent.json().history[0].recipientEmail, "friend@example.com");
        await app.close();
      });
  });

  it("lists uncollected payments for the sender and the recipient", async () => {
    const { app, db } = appWith();
    const unlockAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    recordDeposits(db, [
      {
        recipientEmail: "friend@example.com",
        emailHash: emailHash("friend@example.com"),
        senderEmail: "ada@example.com",
        senderAddress: sender,
        amount: "1500000",
        txHash: "Hash11111111111111111111111111111111",
        logIndex: 0,
        depositId: 1,
        unlockAt,
      },
    ]);
    const outgoing = await app.inject({ method: "GET", url: "/ethw/api/escrow?email=ada@example.com" });
    assert.equal(outgoing.statusCode, 200);
    assert.equal(outgoing.json().outgoing.length, 1);
    assert.equal(outgoing.json().outgoing[0].recipientEmail, "friend@example.com");
    assert.equal(outgoing.json().outgoing[0].amount, "1500000");
    assert.equal(outgoing.json().outgoing[0].reclaimable, false);
    assert.equal(outgoing.json().incoming.length, 0);
    assert.equal(outgoing.json().history.length, 0);
    const incoming = await app.inject({ method: "GET", url: "/ethw/api/escrow?email=friend@example.com" });
    assert.equal(incoming.json().incoming[0].senderEmail, "ada@example.com");
    assert.equal(incoming.json().history.length, 0);
    await app.close();
  });

  it("refuses to record a deposit or release funds when the server cannot operate escrow", async () => {
    const { app, db } = appWith({ NEAR_ESCROW_ACCOUNT: escrow });
    const missing = await app.inject({
      method: "POST",
      url: "/ethw/api/escrow/deposit",
      payload: {
        senderEmail: "ada@example.com",
        recipientEmail: "friend@example.com",
        txHash: "Hash11111111111111111111111111111111",
      },
    });
    assert.equal(missing.statusCode, 404);
    const accountId = await registerVerified(app, "friend@example.com");
    assert.equal(accountId, accountIdForEmail("friend@example.com"));
    recordDeposits(db, [
      {
        recipientEmail: "friend@example.com",
        emailHash: emailHash("friend@example.com"),
        senderEmail: "ada@example.com",
        senderAddress: sender,
        amount: "1500000",
        txHash: "Hash22222222222222222222222222222222",
        logIndex: 0,
        depositId: 2,
        unlockAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      },
    ]);
    const release = await app.inject({
      method: "POST",
      url: "/ethw/api/escrow/release",
      payload: { email: "friend@example.com" },
    });
    assert.equal(release.statusCode, 503);
    const stillThere = await app.inject({ method: "GET", url: "/ethw/api/escrow?email=friend@example.com" });
    assert.equal(stillThere.json().incoming.length, 1);
    await app.close();
  });
});
