import { keccak_256 } from "@noble/hashes/sha3";
import { base58 } from "@scure/base";

export const P256_FACTORY_ID = "p256-passkey-wallet-contract.trezu.near";
const TIMEOUT_SECS = 3600;

export interface PasskeyPublicKey {
  curve: "p256" | "ed25519";
  bytes: Uint8Array;
}

class BorshWriter {
  private readonly chunks: number[] = [];

  writeU8(value: number): this {
    this.chunks.push(value & 0xff);
    return this;
  }

  writeU32(value: number): this {
    this.chunks.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
    return this;
  }

  writeU64(value: bigint): this {
    let current = BigInt.asUintN(64, value);
    for (let i = 0; i < 8; i += 1) {
      this.chunks.push(Number(current & 0xffn));
      current >>= 8n;
    }
    return this;
  }

  writeFixed(value: Uint8Array): this {
    for (const byte of value) this.chunks.push(byte);
    return this;
  }

  writeBytes(value: Uint8Array): this {
    this.writeU32(value.length);
    return this.writeFixed(value);
  }

  writeString(value: string): this {
    return this.writeBytes(new TextEncoder().encode(value));
  }

  toBytes(): Uint8Array {
    return Uint8Array.from(this.chunks);
  }
}

function compareBytes(a: Uint8Array, b: Uint8Array): number {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

export function serializeWalletState(publicKey: PasskeyPublicKey): Uint8Array {
  const writer = new BorshWriter();
  writer.writeU8(1);
  writer.writeU32(0);
  writer.writeFixed(publicKey.bytes);
  writer.writeU32(TIMEOUT_SECS);
  writer.writeU64(0n);
  writer.writeU32(0);
  writer.writeU32(0);
  writer.writeU32(0);
  return writer.toBytes();
}

export type CodeId = { hash: string } | { account_id: string };

export function serializeStateInit(
  code: CodeId,
  data: ReadonlyArray<readonly [Uint8Array, Uint8Array]>,
): Uint8Array {
  const writer = new BorshWriter();
  writer.writeU8(0);
  if ("hash" in code) {
    const bytes = base58.decode(code.hash);
    if (bytes.length !== 32) throw new Error("code hash must be 32 bytes");
    writer.writeU8(0).writeFixed(bytes);
  } else {
    writer.writeU8(1).writeString(code.account_id);
  }
  const sorted = [...data].sort((a, b) => compareBytes(a[0], b[0]));
  writer.writeU32(sorted.length);
  for (const [key, value] of sorted) {
    writer.writeBytes(key);
    writer.writeBytes(value);
  }
  return writer.toBytes();
}

export function serializeDefaultStateInit(publicKey: PasskeyPublicKey): Uint8Array {
  const factory = publicKey.curve === "p256" ? P256_FACTORY_ID : "ed25519-passkey-wallet-contract.trezu.near";
  return serializeStateInit({ account_id: factory }, [[new Uint8Array(0), serializeWalletState(publicKey)]]);
}

export function deriveAccountIdFromStateInit(stateInit: Uint8Array): string {
  const hash = keccak_256(stateInit);
  return `0s${Buffer.from(hash.subarray(12, 32)).toString("hex")}`;
}

export function deriveAccountId(publicKey: PasskeyPublicKey): string {
  return deriveAccountIdFromStateInit(serializeDefaultStateInit(publicKey));
}

export function publicKeyToString(publicKey: PasskeyPublicKey): string {
  return `${publicKey.curve}:${base58.encode(publicKey.bytes)}`;
}

export function compressedP256(x: Uint8Array, y: Uint8Array): Uint8Array {
  if (x.length !== 32 || y.length !== 32) throw new Error("expected a P-256 point");
  const prefix = (y[31] & 1) === 0 ? 0x02 : 0x03;
  const out = new Uint8Array(33);
  out[0] = prefix;
  out.set(x, 1);
  return out;
}
