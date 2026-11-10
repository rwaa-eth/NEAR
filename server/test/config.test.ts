import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadConfig } from "../src/config";

describe("EVM network", () => {
  it("defaults to Base Sepolia", () => {
    const config = loadConfig({});
    assert.equal(config.evmNetwork, "testnet");
    assert.equal(config.chainId, 84532);
    assert.equal(config.chainName, "Base Sepolia");
    assert.equal(config.explorer, "https://sepolia.basescan.org");
    assert.equal(config.baseRpcUrl, "https://sepolia.base.org");
  });

  it("selects Base mainnet when asked", () => {
    const config = loadConfig({ EVM_NETWORK: "mainnet" });
    assert.equal(config.evmNetwork, "mainnet");
    assert.equal(config.chainId, 8453);
    assert.equal(config.chainName, "Base");
    assert.equal(config.explorer, "https://basescan.org");
    assert.equal(config.baseRpcUrl, "https://mainnet.base.org");
  });

  it("keeps an explicit RPC URL", () => {
    const config = loadConfig({ EVM_NETWORK: "testnet", BASE_RPC_URL: "https://rpc.example" });
    assert.equal(config.baseRpcUrl, "https://rpc.example");
    assert.equal(config.chainId, 84532);
  });

  it("rejects an unknown network", () => {
    assert.throws(() => loadConfig({ EVM_NETWORK: "goerli" }), /mainnet or testnet/);
  });
});
