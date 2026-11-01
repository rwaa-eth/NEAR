import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildApp } from "../src/app";
import { loadConfig } from "../src/config";
import { openDatabase } from "../src/db";

const publicKey = `0x${"ab".repeat(64)}`;
const address = "0x1111111111111111111111111111111111111111";

function testApp() {
  const config = loadConfig({
    ...process.env,
    STATIC_API_TOKEN: "test-token",
    SQLITE_PATH: ":memory:",
    ERC20_ADDRESS: "0x2222222222222222222222222222222222222222",
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
        address,
        credentialId: "credential-ada",
        publicKey,
        emailToken: "not-a-real-session-token",
      },
    });
    assert.equal(blocked.statusCode, 401);

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
        address,
        credentialId: "credential-ada",
        publicKey,
        emailToken,
      },
    });
    assert.equal(created.statusCode, 200);
    assert.equal(created.json().address, address);

    const replay = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "ada@example.com",
        address: "0x3333333333333333333333333333333333333333",
        credentialId: "credential-other",
        publicKey,
        emailToken,
      },
    });
    assert.equal(replay.statusCode, 409);
    await app.close();
  });
});
