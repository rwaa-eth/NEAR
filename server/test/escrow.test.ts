import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildApp } from "../src/app";
import { loadConfig } from "../src/config";
import { openDatabase } from "../src/db";
import { DEPOSIT_TOPIC, depositsFromReceipt, emailHash, recordDeposits } from "../src/escrow";

const escrow = "0x2222222222222222222222222222222222222222";
const sender = "0x1111111111111111111111111111111111111111";
const publicKey = `0x${"ab".repeat(64)}`;

function appWith(extra: Record<string, string> = {}) {
  const config = loadConfig({
    ...process.env,
    STATIC_API_TOKEN: "test-token",
    SQLITE_PATH: ":memory:",
    ERC20_ADDRESS: "0x3333333333333333333333333333333333333333",
    ERC20_SYMBOL: "USDT",
    ESCROW_ADDRESS: "",
    ESCROW_OPERATOR_KEY: "",
    EMAIL_DEV_MODE: "true",
    RESEND_API_KEY: "",
    SMTP_URL: "",
    ...extra,
  });
  const db = openDatabase(":memory:");
  return { app: buildApp(config, db), db };
}

async function registerVerified(
  app: ReturnType<typeof appWith>["app"],
  email: string,
  accountAddress: string,
  credentialId: string,
): Promise<void> {
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
      address: accountAddress,
      credentialId,
      publicKey,
      emailToken: verified.json().emailToken,
    },
  });
  assert.equal(created.statusCode, 200);
}

describe("email escrow", () => {
  it("reads a successful deposit for the lowercase email", () => {
    const hash = emailHash("Ada@Example.com");
    assert.equal(hash, emailHash("ada@example.com"));
    assert.equal(hash.length, 66);
    const unlockAt = 1_700_000_000;
    const parsed = depositsFromReceipt(
      {
        status: "0x1",
        logs: [
          {
            address: escrow.toUpperCase(),
            topics: [
              DEPOSIT_TOPIC,
              `0x${(7n).toString(16).padStart(64, "0")}`,
              hash,
              `0x${sender.slice(2).padStart(64, "0")}`,
            ],
            data: `0x${(1_500_000n).toString(16).padStart(64, "0")}${(BigInt(unlockAt)).toString(16).padStart(64, "0")}`,
            logIndex: "0x2",
          },
        ],
      },
      escrow,
      hash,
    );
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].amount, "1500000");
    assert.equal(parsed[0].from, sender);
    assert.equal(parsed[0].depositId, 7);
    assert.equal(parsed[0].unlockAt, unlockAt);
    assert.equal(parsed[0].logIndex, 2);
    assert.equal(depositsFromReceipt({ status: "0x0", logs: [] }, escrow, hash).length, 0);
    assert.equal(depositsFromReceipt({ status: "0x1", logs: [] }, escrow, emailHash("other@example.com")).length, 0);
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
        txHash: `0x${"cd".repeat(32)}`,
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
    const incoming = await app.inject({ method: "GET", url: "/ethw/api/escrow?email=friend@example.com" });
    assert.equal(incoming.json().incoming[0].senderEmail, "ada@example.com");
    const refused = await app.inject({
      method: "POST",
      url: "/ethw/api/escrow/deposit",
      payload: {
        senderEmail: "ada@example.com",
        recipientEmail: "friend@example.com",
        txHash: `0x${"ab".repeat(32)}`,
      },
    });
    assert.equal(refused.statusCode, 400);
    await app.close();
  });

  it("refuses to record a deposit or release funds when the server cannot operate escrow", async () => {
    const { app, db } = appWith({ ESCROW_ADDRESS: escrow });
    const missing = await app.inject({
      method: "POST",
      url: "/ethw/api/escrow/deposit",
      payload: {
        senderEmail: "ada@example.com",
        recipientEmail: "friend@example.com",
        txHash: `0x${"ab".repeat(32)}`,
      },
    });
    assert.equal(missing.statusCode, 404);
    await registerVerified(app, "friend@example.com", "0x4444444444444444444444444444444444444444", "credential-friend");
    recordDeposits(db, [
      {
        recipientEmail: "friend@example.com",
        emailHash: emailHash("friend@example.com"),
        senderEmail: "ada@example.com",
        senderAddress: sender,
        amount: "1500000",
        txHash: `0x${"cd".repeat(32)}`,
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
