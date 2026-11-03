import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildApp } from "../src/app";
import { loadConfig } from "../src/config";
import { openDatabase } from "../src/db";
import { accountIdForEmail } from "../src/near";

const publicKey = "ed25519:11111111111111111111111111111111";

function testApp() {
  const config = loadConfig({
    ...process.env,
    STATIC_API_TOKEN: "test-token",
    SQLITE_PATH: ":memory:",
    NEAR_PROVISION_ACCOUNTS: "false",
    NEAR_TOKEN_ACCOUNT: "token.testnet",
    NEAR_TOKEN_SYMBOL: "USDT",
    NEAR_ESCROW_ACCOUNT: "",
    NEAR_OPERATOR_KEY: "",
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
    assert.match(page.body, /NEAR testnet/);
    assert.match(page.body, /To collect/);
    assert.match(page.body, /Waiting for collection/);
    const config = await app.inject({ method: "GET", url: "/ethw/api/config" });
    assert.equal(config.statusCode, 200);
    assert.equal(config.json().symbol, "USDT");
    assert.equal(config.json().token, "token.testnet");
    assert.equal(config.json().network, "testnet");
    assert.equal(config.json().escrow, null);
    const sendPage = await app.inject({ method: "GET", url: "/send" });
    assert.equal(sendPage.statusCode, 200);
    assert.match(sendPage.body, /NEAR account/);
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
    const created = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: { email: "Ada@Example.com", publicKey, emailToken },
    });
    assert.equal(created.statusCode, 200);
    assert.equal(created.json().accountId, accountIdForEmail("ada@example.com"));
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
});
