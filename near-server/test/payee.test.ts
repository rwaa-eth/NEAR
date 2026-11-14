import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { eip681Payment, payeeFromQr } from "../src/payee";

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

  it("reads an Ethereum payment request", () => {
    const raw =
      "ethereum:0x3b79cac2c60408ea54b7b13efc055e9463cdd8ec?amount=35.064635&label=RKLN3H&uuid=U2SJSTHWVYNWCDN8&req-asset=0xdAC17F958D2ee523a2206206994597C13D831ec7";
    assert.deepEqual(eip681Payment(raw), {
      address: "0x3b79cac2c60408ea54b7b13efc055e9463cdd8ec",
      amount: "35.064635",
      label: "RKLN3H",
      uuid: "U2SJSTHWVYNWCDN8",
      usdt: true,
    });
    assert.equal(payeeFromQr(raw), "0x3b79cac2c60408ea54b7b13efc055e9463cdd8ec");
    assert.equal(eip681Payment("ethereum:0x1111111111111111111111111111111111111111") , null);
    assert.equal(
      eip681Payment("ethereum:0x1111111111111111111111111111111111111111?amount=1&req-asset=0x0000000000000000000000000000000000000001")?.usdt,
      false,
    );
  });
});
