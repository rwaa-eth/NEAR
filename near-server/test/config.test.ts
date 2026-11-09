import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadConfig } from "../src/config";

describe("NEAR network", () => {
  it("defaults to testnet", () => {
    const config = loadConfig({});
    assert.equal(config.nearNetwork, "testnet");
    assert.equal(config.nearRpcUrl, "https://rpc.testnet.near.org");
  });

  it("selects mainnet when asked", () => {
    const config = loadConfig({ NEAR_NETWORK: "mainnet" });
    assert.equal(config.nearNetwork, "mainnet");
    assert.equal(config.nearRpcUrl, "https://rpc.mainnet.near.org");
  });

  it("keeps an explicit RPC URL", () => {
    const config = loadConfig({ NEAR_NETWORK: "mainnet", NEAR_RPC_URL: "https://rpc.example" });
    assert.equal(config.nearRpcUrl, "https://rpc.example");
  });

  it("rejects an unknown network", () => {
    assert.throws(() => loadConfig({ NEAR_NETWORK: "betanet" }), /mainnet or testnet/);
  });
});
