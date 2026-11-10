import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadConfig } from "../src/config";
import { implicitAccountId, nearTopUp } from "../src/near";

describe("NEAR network", () => {
  it("defaults to testnet", () => {
    const config = loadConfig({});
    assert.equal(config.nearNetwork, "testnet");
    assert.equal(config.nearRpcUrl, "https://rpc.testnet.fastnear.com");
  });

  it("selects mainnet when asked", () => {
    const config = loadConfig({ NEAR_NETWORK: "mainnet" });
    assert.equal(config.nearNetwork, "mainnet");
    assert.equal(config.nearRpcUrl, "https://free.rpc.fastnear.com");
  });

  it("keeps an explicit RPC URL", () => {
    const config = loadConfig({ NEAR_NETWORK: "mainnet", NEAR_RPC_URL: "https://rpc.example" });
    assert.equal(config.nearRpcUrl, "https://rpc.example");
  });

  it("rejects an unknown network", () => {
    assert.throws(() => loadConfig({ NEAR_NETWORK: "betanet" }), /mainnet or testnet/);
  });

  it("fills a wallet to 0.05 NEAR and refills at 0.01", () => {
    const config = loadConfig({});
    assert.equal(config.nearAccountBalance, 50_000_000_000_000_000_000_000n);
    assert.equal(config.invitePassword, "");
    assert.equal(config.nearTopupMinimum, 10_000_000_000_000_000_000_000n);
    const custom = loadConfig({ NEAR_ACCOUNT_BALANCE: "0.2", NEAR_TOPUP_MINIMUM: "0.03" });
    assert.equal(nearTopUp(0n, custom.nearAccountBalance, custom.nearTopupMinimum), custom.nearAccountBalance);
    assert.equal(
      nearTopUp(custom.nearTopupMinimum, custom.nearAccountBalance, custom.nearTopupMinimum),
      custom.nearAccountBalance - custom.nearTopupMinimum,
    );
    assert.equal(nearTopUp(custom.nearTopupMinimum + 1n, custom.nearAccountBalance, custom.nearTopupMinimum), 0n);
    assert.equal(
      implicitAccountId("ed25519:6fftm93LzR27E4cfzBaVSvfSCL9QSVf13j6wvHUEoFEi"),
      "54327b2f304e8cbe502a432a591c0bc182881e681e38fad97d270d8c2a90a073",
    );
  });
});
