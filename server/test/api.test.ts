import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildApp } from "../src/app";
import { loadConfig } from "../src/config";
import { openDatabase } from "../src/db";

function testApp() {
  const config = loadConfig({
    ...process.env,
    STATIC_API_TOKEN: "test-token",
    SQLITE_PATH: ":memory:",
    ORIGIN: "https://rwaa.percolate.one",
    RP_ID: "rwaa.percolate.one",
    SHA256_CERT_FINGERPRINT: "",
    NEAR_RELAYER_ACCOUNT: "",
  });
  return buildApp(config, openDatabase(":memory:"));
}

describe("API gates", () => {
  it("serves the login page and empty asset links without a token", async () => {
    const app = testApp();
    const login = await app.inject({ method: "GET", url: "/login" });
    assert.equal(login.statusCode, 200);
    assert.match(login.body, /Create passkey/);
    assert.match(login.body, /\/favicon\.ico/);
    assert.match(login.body, /test-token/);
    const links = await app.inject({ method: "GET", url: "/.well-known/assetlinks.json" });
    assert.equal(links.statusCode, 200);
    assert.equal(links.body, "[]");
    await app.close();
  });

  it("rejects a parcel write that has no static token", async () => {
    const app = testApp();
    const response = await app.inject({ method: "POST", url: "/v1/parcels", payload: { ring: [[0, 0], [1, 0], [0, 1]] } });
    assert.equal(response.statusCode, 401);
    await app.close();
  });

  it("issues a challenge for the static token and still requires a passkey to write", async () => {
    const app = testApp();
    const missing = await app.inject({
      method: "POST",
      url: "/v1/auth/challenge",
    });
    assert.equal(missing.statusCode, 401);
    const challenge = await app.inject({
      method: "POST",
      url: "/v1/auth/challenge",
      headers: { authorization: "Bearer test-token" },
    });
    assert.equal(challenge.statusCode, 200);
    const body = challenge.json();
    assert.equal(typeof body.challengeId, "string");
    assert.equal(typeof body.nonce, "string");
    const write = await app.inject({
      method: "POST",
      url: "/v1/parcels",
      headers: { authorization: "Bearer test-token" },
      payload: { ring: [[0, 0], [0.001, 0], [0, 0.001]] },
    });
    assert.equal(write.statusCode, 401);
    await app.close();
  });

  it("publishes the android certificate when one is configured", async () => {
    const config = loadConfig({
      ...process.env,
      STATIC_API_TOKEN: "test-token",
      SHA256_CERT_FINGERPRINT: "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99",
      PACKAGE_NAME: "one.percolate.rwaa",
    });
    const app = buildApp(config, openDatabase(":memory:"));
    const links = await app.inject({ method: "GET", url: "/.well-known/assetlinks.json" });
    const parsed = links.json();
    assert.equal(parsed[0].target.package_name, "one.percolate.rwaa");
    assert.equal(parsed[0].target.sha256_cert_fingerprints[0].startsWith("AA:BB"), true);
    await app.close();
  });
});
