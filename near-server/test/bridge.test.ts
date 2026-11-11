import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatNear, intentsFee } from "../src/bridge";

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
