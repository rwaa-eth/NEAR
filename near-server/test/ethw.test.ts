import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildApp } from "../src/app";
import { loadConfig } from "../src/config";
import { openDatabase } from "../src/db";
import { implicitAccountId } from "../src/near";
import { recordDeposits } from "../src/escrow";
import { normalizeSignupKey } from "../src/signupKey";

const publicKey = "ed25519:11111111111111111111111111111111";

function testApp() {
  const config = loadConfig({
    ...process.env,
    STATIC_API_TOKEN: "test-token",
    SQLITE_PATH: ":memory:",
    NEAR_NETWORK: "testnet",
    NEAR_PROVISION_ACCOUNTS: "false",
    NEAR_TOKEN_ACCOUNT: "token.testnet",
    NEAR_TOKEN_SYMBOL: "USDT",
    NEAR_ESCROW_ACCOUNT: "",
    NEAR_OPERATOR_ACCOUNT: "",
    NEAR_OPERATOR_KEY: "",
    NEAR_RCV_KEY: "",
    EMAIL_DEV_MODE: "true",
    RESEND_API_KEY: "",
    SMTP_URL: "",
  });
  return buildApp(config, openDatabase(":memory:"));
}

async function verifiedToken(app: ReturnType<typeof testApp>, email: string): Promise<string> {
  const sent = await app.inject({ method: "POST", url: "/ethw/api/otp/send", payload: { email } });
  assert.equal(sent.statusCode, 200);
  const verified = await app.inject({
    method: "POST",
    url: "/ethw/api/otp/verify",
    payload: { email, code: sent.json().devCode },
  });
  assert.equal(verified.statusCode, 200);
  return verified.json().emailToken as string;
}

describe("NEAR wallet", () => {
  it("serves the wallet page without the API token", async () => {
    const app = testApp();
    const page = await app.inject({ method: "GET", url: "/" });
    assert.equal(page.statusCode, 200);
    const legacy = await app.inject({ method: "GET", url: "/ethw" });
    assert.equal(legacy.statusCode, 302);
    assert.equal(legacy.headers.location, "/");
    assert.match(page.body, /RaOpenwallet/);
    assert.match(page.body, /\/wallet\.js/);
    assert.match(page.body, /id="network-label"/);
    assert.match(page.body, /NEAR testnet/);
    assert.match(page.body, /id="scan-address"/);
    assert.match(page.body, /To collect/);
    assert.match(page.body, /Waiting for collection/);
    assert.match(page.body, /Empty wallet/);
    assert.match(page.body, /\.lozenge \{[\s\S]*?z-index: 30;/);
    const config = await app.inject({ method: "GET", url: "/ethw/api/config" });
    assert.equal(config.statusCode, 200);
    assert.equal(config.json().symbol, "USDT");
    assert.equal(config.json().token, "token.testnet");
    assert.equal(config.json().network, "testnet");
    assert.equal(config.json().escrow, null);
    const sendPage = await app.inject({ method: "GET", url: "/send" });
    assert.equal(sendPage.statusCode, 200);
    assert.match(sendPage.body, /NEAR account/);
    assert.match(sendPage.body, /id="scan-modal"/);
    assert.match(sendPage.body, /id="signup-key"/);
    await app.close();
  });

  it("stores an email against its NEAR account", async () => {
    const app = testApp();
    const missing = await app.inject({
      method: "GET",
      url: "/ethw/api/account?email=ada@example.com",
    });
    assert.equal(missing.json().registered, false);
    const emailToken = await verifiedToken(app, "Ada@Example.com");
    const denied = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: { email: "Ada@Example.com", publicKey, emailToken },
    });
    assert.equal(denied.statusCode, 403);
    const issued = await app.inject({
      method: "POST",
      url: "/v1/signup-keys",
      headers: { authorization: "Bearer test-token" },
    });
    assert.equal(issued.statusCode, 200);
    assert.equal(issued.json().seq, 1);
    const next = await app.inject({
      method: "POST",
      url: "/v1/signup-keys",
      headers: { authorization: "Bearer test-token" },
    });
    assert.equal(next.json().seq, 2);
    const created = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: { email: "Ada@Example.com", publicKey, emailToken, signupKey: issued.json().code },
    });
    assert.equal(created.statusCode, 200);
    assert.equal(created.json().accountId, implicitAccountId(publicKey));
    const otherToken = await verifiedToken(app, "bob@example.com");
    const reused = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "bob@example.com",
        publicKey: "ed25519:8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR",
        emailToken: otherToken,
        signupKey: issued.json().code,
      },
    });
    assert.equal(reused.statusCode, 403);
    const found = await app.inject({
      method: "GET",
      url: "/ethw/api/account?email=ada@example.com",
    });
    assert.equal(found.json().registered, true);
    assert.equal(found.json().accountId, created.json().accountId);
    const clash = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "ada@example.com",
        publicKey: "ed25519:22222222222222222222222222222222",
        emailToken: "another-fake-token-value",
      },
    });
    assert.equal(clash.statusCode, 409);
    await app.close();
  });

  it("issues an invite code after the invite password", async () => {
    const config = loadConfig({
      ...process.env,
      STATIC_API_TOKEN: "test-token",
      SQLITE_PATH: ":memory:",
      NEAR_PROVISION_ACCOUNTS: "false",
      NEAR_OPERATOR_KEY: "",
      NEAR_RCV_KEY: "",
      INVITE_PASSWORD: "open-sesame",
      EMAIL_DEV_MODE: "true",
      RESEND_API_KEY: "",
      SMTP_URL: "",
    });
    const app = buildApp(config, openDatabase(":memory:"));
    const page = await app.inject({ method: "GET", url: "/invite" });
    assert.equal(page.statusCode, 200);
    assert.match(page.body, /id="password"/);
    assert.equal(page.body.includes("open-sesame"), false);
    const denied = await app.inject({
      method: "POST",
      url: "/invite",
      payload: { password: "nope" },
    });
    assert.equal(denied.statusCode, 401);
    const issued = await app.inject({
      method: "POST",
      url: "/invite",
      payload: { password: "open-sesame" },
    });
    assert.equal(issued.statusCode, 200, issued.body);
    assert.equal(issued.json().seq, 1);
    assert.match(issued.json().code, /^[A-Z]{8}$/);
    assert.equal(normalizeSignupKey(`1-${issued.json().code.toLowerCase()}`), issued.json().code);
    const emailToken = await verifiedToken(app, "ada@example.com");
    const created = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "ada@example.com",
        publicKey,
        emailToken,
        signupKey: issued.json().code,
      },
    });
    assert.equal(created.statusCode, 200, created.body);
    await app.close();
  });

  it("checks balances and payments waiting to collect from the dev page", async () => {
    const config = loadConfig({
      ...process.env,
      STATIC_API_TOKEN: "test-token",
      SQLITE_PATH: ":memory:",
      NEAR_OPERATOR_KEY: "",
      NEAR_RCV_KEY: "",
      DEV_PASSWORD: "dev-secret",
      NEAR_TOKEN_SYMBOL: "USDT",
      NEAR_TOKEN_DECIMALS: "6",
    });
    const db = openDatabase(":memory:");
    const app = buildApp(config, db);
    recordDeposits(db, [
      {
        recipientEmail: "ada@example.com",
        emailHash: "11".repeat(32),
        senderEmail: "sam@example.com",
        senderAddress: "a".repeat(64),
        amount: "1500000",
        txHash: "tx-dev",
        logIndex: 0,
        depositId: 4,
        unlockAt: Math.floor(Date.now() / 1000) + 86_400,
      },
    ]);
    const page = await app.inject({ method: "GET", url: "/devcheck" });
    assert.equal(page.statusCode, 200);
    assert.match(page.body, /id="password"/);
    assert.match(page.body, /id="check-form" hidden/);
    assert.equal(page.body.includes("dev-secret"), false);
    const denied = await app.inject({
      method: "POST",
      url: "/devcheck",
      payload: { password: "nope", email: "ada@example.com" },
    });
    assert.equal(denied.statusCode, 401);
    const opened = await app.inject({ method: "POST", url: "/devcheck", payload: { password: "dev-secret" } });
    assert.equal(opened.statusCode, 200, opened.body);
    assert.equal(opened.json().ok, true);
    const checked = await app.inject({
      method: "POST",
      url: "/devcheck",
      payload: { password: "dev-secret", email: "Ada@Example.com" },
    });
    assert.equal(checked.statusCode, 200, checked.body);
    assert.equal(checked.json().registered, false);
    assert.equal(checked.json().near, null);
    assert.equal(checked.json().incoming.length, 1);
    assert.equal(checked.json().incoming[0].amount, "1500000");
    assert.equal(checked.json().incoming[0].senderEmail, "sam@example.com");
    await app.close();
  });

  it("names the operator account a wallet can return funds to", async () => {
    const missing = testApp();
    const denied = await missing.inject({ method: "POST", url: "/ethw/api/return-target" });
    assert.equal(denied.statusCode, 503);
    await missing.close();
    const config = loadConfig({
      ...process.env,
      STATIC_API_TOKEN: "test-token",
      SQLITE_PATH: ":memory:",
      NEAR_NETWORK: "testnet",
      NEAR_OPERATOR_ACCOUNT: "operator.testnet",
      NEAR_OPERATOR_KEY: "",
      NEAR_RCV_KEY: "",
      NEAR_TOKEN_ACCOUNT: "",
    });
    const app = buildApp(config, openDatabase(":memory:"));
    const ready = await app.inject({ method: "POST", url: "/ethw/api/return-target" });
    assert.equal(ready.statusCode, 200, ready.body);
    assert.equal(ready.json().accountId, "operator.testnet");
    await app.close();
  });

  it("refuses an Ethereum bridge until the server is on mainnet", async () => {
    const app = testApp();
    const denied = await app.inject({
      method: "POST",
      url: "/ethw/api/bridge",
      payload: {
        accountId: "alice.testnet",
        recipient: "0x1111111111111111111111111111111111111111",
        amount: "1000000",
      },
    });
    assert.equal(denied.statusCode, 400);
    assert.match(denied.json().error, /mainnet/);
    await app.close();
  });
});
