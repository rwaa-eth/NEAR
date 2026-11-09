import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { payeeFromQr } from "../src/payee";

describe("QR payee", () => {
  it("reads addresses, account ids, and emails", () => {
    const evm = "0x1111111111111111111111111111111111111111";
    assert.equal(payeeFromQr(evm), evm);
    assert.equal(payeeFromQr(`ethereum:${evm}@84532?value=1`), evm);
    assert.equal(payeeFromQr("alice.testnet"), "alice.testnet");
    assert.equal(payeeFromQr("near:Bob.near"), "bob.near");
    assert.equal(payeeFromQr("mailto:Ada@Example.com"), "ada@example.com");
    assert.equal(payeeFromQr("a".repeat(64)), "a".repeat(64));
    assert.equal(payeeFromQr(""), "");
  });
});
