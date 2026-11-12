import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatNear, intentsFee, prepareEthereumBridge } from "../src/bridge";
import { loadConfig } from "../src/config";

describe("bridge amounts", () => {
  it("shows a NEAR fee without trailing zeros", () => {
    assert.equal(formatNear(3_965_000_000_000_000_000_000_000n), "3.965");
    assert.equal(formatNear(50_000_000_000_000_000_000_000n), "0.05");
    assert.equal(formatNear(0n), "0");
  });

  it("counts the USDT Intents keeps", () => {
    assert.equal(intentsFee(10_000_000n, 9_698_828n), 301_172n);
    assert.equal(intentsFee(500_000n, 199_898n), 300_102n);
    assert.equal(intentsFee(100n, 100n), 0n);
  });

  it("refuses a bridge below 10 USDT before asking for a quote", async () => {
    const config = loadConfig({ NEAR_NETWORK: "mainnet", NEAR_TOKEN_ACCOUNT: "usdt.tether-token.near" });
    await assert.rejects(
      () =>
        prepareEthereumBridge(config, {
          accountId: "a".repeat(64),
          recipient: "0x1111111111111111111111111111111111111111",
          amount: "9999999",
        }),
      /minimum bridge amount is 10 USDT/,
    );
  });
});

describe("bridge amounts", () => {
  it("shows a NEAR fee without trailing zeros", () => {
    assert.equal(formatNear(3_965_000_000_000_000_000_000_000n), "3.965");
    assert.equal(formatNear(50_000_000_000_000_000_000_000n), "0.05");
    assert.equal(formatNear(0n), "0");
  });

  it("counts the USDT Intents keeps", () => {
    assert.equal(intentsFee(10_000_000n, 9_698_828n), 301_172n);
    assert.equal(intentsFee(500_000n, 199_898n), 300_102n);
    assert.equal(intentsFee(100n, 100n), 0n);
  });
});
