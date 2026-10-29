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
    ERC20_SYMBOL: "USDT",
    BASE_PAYMASTER: "false",
  });
  return buildApp(config, openDatabase(":memory:"));
}

describe("Base Sepolia wallet", () => {
  it("serves the wallet page without the API token", async () => {
    const app = testApp();
    const page = await app.inject({ method: "GET", url: "/" });
    assert.equal(page.statusCode, 200);
    const legacy = await app.inject({ method: "GET", url: "/ethw" });
    assert.equal(legacy.statusCode, 302);
    assert.equal(legacy.headers.location, "/");
    assert.match(page.body, /RaOpenwallet/);
    assert.match(page.body, /\/ragraphic\.jpg/);
    assert.match(page.body, /\/favicon\.ico/);
    const icon = await app.inject({ method: "GET", url: "/favicon.ico" });
    assert.equal(icon.statusCode, 200);
    assert.equal(icon.headers["content-type"], "image/x-icon");
    assert.match(page.body, /\/ethw\.js/);
    assert.match(page.body, /id="me"/);
    assert.match(page.body, /id="recipient-avatar"/);
    const config = await app.inject({ method: "GET", url: "/ethw/api/config" });
    assert.equal(config.statusCode, 200);
    assert.equal(config.json().symbol, "USDT");
    assert.equal(config.json().erc20, "0x2222222222222222222222222222222222222222");
    assert.equal(config.json().escrow, null);
    assert.match(page.body, /To collect/);
    assert.match(page.body, /Waiting for collection/);
    await app.close();
  });

  it("stores an email against the passkey account", async () => {
    const app = testApp();
    const missing = await app.inject({
      method: "GET",
      url: "/ethw/api/account?email=ada@example.com",
    });
    assert.equal(missing.json().registered, false);
    const created = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "Ada@Example.com",
        address,
        credentialId: "credential-ada",
        publicKey,
      },
    });
    assert.equal(created.statusCode, 200);
    assert.equal(created.json().address, address);
    const found = await app.inject({
      method: "GET",
      url: "/ethw/api/account?email=ada@example.com",
    });
    assert.equal(found.json().registered, true);
    assert.equal(found.json().address, address);
    const clash = await app.inject({
      method: "POST",
      url: "/ethw/api/register",
      payload: {
        email: "ada@example.com",
        address: "0x3333333333333333333333333333333333333333",
        credentialId: "credential-other",
        publicKey,
      },
    });
    assert.equal(clash.statusCode, 409);
    await app.close();
  });
});
