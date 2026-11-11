import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chooseBridgeFee, formatNear, minSwapOut, unregisteredRefTokens } from "../src/bridge";

describe("bridge amounts", () => {
  it("shows a NEAR fee without trailing zeros", () => {
    assert.equal(formatNear(3_965_000_000_000_000_000_000_000n), "3.965");
    assert.equal(formatNear(50_000_000_000_000_000_000_000n), "0.05");
    assert.equal(formatNear(0n), "0");
  });

  it("takes the relayer fee from the bridged token", () => {
    assert.deepEqual(chooseBridgeFee({ tokenFee: 13320n, nativeFee: 3_588_845_465_033_757_949_952n, usdFee: 0.01 }, 6), {
      tokenFee: 13320n,
      nativeFee: 0n,
    });
    assert.deepEqual(chooseBridgeFee({ tokenFee: 0n, nativeFee: 3_588_845_465_033_757_949_952n, usdFee: 0.01 }, 6), {
      tokenFee: 15000n,
      nativeFee: 0n,
    });
    assert.deepEqual(chooseBridgeFee({ tokenFee: 0n, nativeFee: 5n, usdFee: 0 }, 6), {
      tokenFee: 0n,
      nativeFee: 5n,
    });
  });

  it("keeps one percent of room on the USDT swap", () => {
    assert.equal(minSwapOut(499_363n), 494_369n);
    assert.equal(minSwapOut(0n), 0n);
  });

  it("skips Rhea registration once both USDT tokens are present", () => {
    const deposits = {
      "usdt.tether-token.near": "0",
      "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": "0",
    };
    assert.deepEqual(unregisteredRefTokens(deposits, Object.keys(deposits)), []);
    assert.deepEqual(unregisteredRefTokens({}, ["usdt.tether-token.near"]), ["usdt.tether-token.near"]);
  });
});
