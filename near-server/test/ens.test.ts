import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyEns } from "../src/ens";

describe("ENS queries", () => {
  it("tells names and addresses apart", () => {
    assert.equal(classifyEns("vitalik.eth"), "forward");
    assert.equal(classifyEns("  Pay.Vitalik.eth "), "forward");
    assert.equal(classifyEns("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"), "reverse");
    assert.equal(classifyEns("0xd8da6bf26964af9d7eed9e03e53415d37aa96045"), "reverse");
    assert.equal(classifyEns("ada@example.com"), null);
    assert.equal(classifyEns("alice.near"), null);
    assert.equal(classifyEns("vitalik.et"), null);
    assert.equal(classifyEns(""), null);
  });
});
