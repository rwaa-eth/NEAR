import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildApp } from "../src/app";
import { loadConfig } from "../src/config";
import { openDatabase } from "../src/db";

const publicKey = "ed25519:11111111111111111111111111111111";

function testApp() {
  const config = loadConfig({
    ...process.env,
    STATIC_API_TOKEN: "test-token",
    SQLITE_PATH: ":memory:",
    NEAR_NETWORK: "mainnet",
    NEAR_PROVISION_ACCOUNTS: "false",
    NEAR_OPERATOR_KEY: "",
    NEAR_RCV_KEY: "",
    EMAIL_DEV_MODE: "true",
    RESEND_API_KEY: "",
    SMTP_URL: "",
  });
  return buildApp(config, openDatabase(":memory:"));
}

describe("email OTP", () => {
  it("requires a verified email before a new wallet can register", async () => {
    const app = testApp();
    const blocked = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "ada@example.com",
        publicKey,
        emailToken: "not-a-real-session-token",
      },
    });
    assert.equal(blocked.statusCode, 403);
    const issuedEarly = await app.inject({
      method: "POST",
      url: "/v1/signup-keys",
      headers: { authorization: "Bearer test-token" },
    });
    assert.equal(issuedEarly.statusCode, 200);
    const unverified = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "ada@example.com",
        publicKey,
        emailToken: "not-a-real-session-token",
        signupKey: issuedEarly.json().code,
      },
    });
    assert.equal(unverified.statusCode, 401);

    const sent = await app.inject({
      method: "POST",
      url: "/ethw/api/otp/send",
      payload: { email: "Ada@Example.com" },
    });
    assert.equal(sent.statusCode, 200);
    assert.equal(sent.json().sent, true);
    assert.match(sent.json().devCode, /^\d{6}$/);

    const verified = await app.inject({
      method: "POST",
      url: "/ethw/api/otp/verify",
      payload: { email: "ada@example.com", code: sent.json().devCode },
    });
    assert.equal(verified.statusCode, 200);
    const emailToken = verified.json().emailToken as string;
    assert.ok(emailToken.length >= 16);

    const created = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "ada@example.com",
        publicKey,
        emailToken,
        signupKey: issuedEarly.json().code,
      },
    });
    assert.equal(created.statusCode, 200);
    assert.equal(typeof created.json().accountId, "string");

    const replay = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "ada@example.com",
        publicKey: "ed25519:22222222222222222222222222222222",
        emailToken,
      },
    });
    assert.equal(replay.statusCode, 409);
    await app.close();
  });
});
