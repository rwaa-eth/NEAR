import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { base58 } from "@scure/base";
import {
  deriveAccountId,
  deriveAccountIdFromStateInit,
  publicKeyToString,
  serializeDefaultStateInit,
  serializeStateInit,
  serializeWalletState,
  type PasskeyPublicKey,
} from "../src/accountId";

const DATA_ENTRY: readonly [Uint8Array, Uint8Array] = [new Uint8Array([0, 1, 2]), new Uint8Array([3, 4, 5])];

const P256_KEY: PasskeyPublicKey = {
  curve: "p256",
  bytes: new Uint8Array([0x02, ...Array.from({ length: 32 }, (_, i) => i + 1)]),
};

const ED25519_KEY: PasskeyPublicKey = {
  curve: "ed25519",
  bytes: new Uint8Array(Array.from({ length: 32 }, (_, i) => 32 - i)),
};

describe("NEP-616", () => {
  it("matches the code-hash vector", () => {
    const stateInit = serializeStateInit({ hash: "J86LNmZE9nHAxRqUYBZ64iCQYfeacMJhNqvb8WQmpZPE" }, [DATA_ENTRY]);
    assert.equal(deriveAccountIdFromStateInit(stateInit), "0s48ddf87e648de3a52783ee9640e618234cadb18f");
  });

  it("matches the account-id vector", () => {
    const stateInit = serializeStateInit({ account_id: "alice.near" }, [DATA_ENTRY]);
    assert.equal(deriveAccountIdFromStateInit(stateInit), "0sf4d27a587616342eb45b8d785addbe6790695a2e");
  });

  it("pins the default p256 wallet", () => {
    const state = serializeWalletState(P256_KEY);
    assert.equal(state.length, 62);
    assert.equal(Buffer.from(serializeDefaultStateInit(P256_KEY)).toString("hex"),
      "000127000000703235362d706173736b65792d77616c6c65742d636f6e74726163" +
        "742e7472657a752e6e6561720100000000000000" +
        "3e000000" +
        "0100000000" +
        "020102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20" +
        "100e0000" +
        "0000000000000000" +
        "000000000000000000000000");
    assert.equal(deriveAccountId(P256_KEY), "0s9dcb623ddaebc66fffc13ed50e61a3041ddae822");
  });

  it("pins the ed25519 wallet account", () => {
    assert.equal(deriveAccountId(ED25519_KEY), "0s4a151d5470d41fc61df1270f6b20fd453e67b171");
  });

  it("round-trips the public key string", () => {
    const encoded = publicKeyToString(P256_KEY);
    assert.equal(encoded.startsWith("p256:"), true);
    assert.deepEqual(base58.decode(encoded.slice(5)), P256_KEY.bytes);
  });
});
