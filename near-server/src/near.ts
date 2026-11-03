import { base58 } from "@scure/base";
import { keccak_256 } from "@noble/hashes/sha3";
import type { Config } from "./config";

const RELEASE_GAS = 100_000_000_000_000n;

export type TxOutcome = {
  status?: { SuccessValue?: string; SuccessReceiptId?: string; Failure?: unknown } | string;
  transaction?: { hash?: string; signer_id?: string };
  receipts_outcome?: Array<{
    outcome?: {
      executor_id?: string;
      logs?: string[];
      status?: { SuccessValue?: string; SuccessReceiptId?: string; Failure?: unknown } | string;
    };
  }>;
};

type RpcError = {
  message?: string;
  cause?: { name?: string; info?: { response?: string } };
};

function rpcErrorMessage(error: RpcError): string {
  return error.cause?.info?.response || error.cause?.name || error.message || "NEAR RPC failed";
}

export function emailHash(email: string): string {
  return Buffer.from(keccak_256(new TextEncoder().encode(email.trim().toLowerCase()))).toString("hex");
}

/** Named testnet account for an email. The browser holds the full-access key. */
export function accountIdForEmail(email: string, network = "testnet"): string {
  const suffix = network === "mainnet" ? "near" : "testnet";
  return `rw${emailHash(email).slice(0, 16)}.${suffix}`;
}

async function rpc<T>(rpcUrl: string, method: string, params: unknown): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "near", method, params }),
  });
  const body = (await response.json()) as { error?: RpcError; result?: T };
  if (!response.ok || body.error) throw new Error(rpcErrorMessage(body.error ?? {}));
  return body.result as T;
}

export async function accountExists(rpcUrl: string, accountId: string): Promise<boolean> {
  try {
    await rpc(rpcUrl, "query", { request_type: "view_account", finality: "final", account_id: accountId });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("does not exist") || message.includes("UNKNOWN_ACCOUNT")) return false;
    throw error;
  }
}

export async function accountBalance(rpcUrl: string, accountId: string): Promise<string> {
  const result = await rpc<{ amount?: string }>(rpcUrl, "query", {
    request_type: "view_account",
    finality: "final",
    account_id: accountId,
  });
  return result.amount ?? "0";
}

export async function accessKeys(rpcUrl: string, accountId: string): Promise<string[]> {
  const result = await rpc<{ keys?: Array<{ public_key?: string }> }>(rpcUrl, "query", {
    request_type: "view_access_key_list",
    finality: "final",
    account_id: accountId,
  });
  return (result.keys ?? []).map((key) => key.public_key ?? "").filter(Boolean);
}

export async function callView(rpcUrl: string, accountId: string, method: string, args: object): Promise<unknown> {
  const result = await rpc<{ result: number[] }>(rpcUrl, "query", {
    request_type: "call_function",
    finality: "final",
    account_id: accountId,
    method_name: method,
    args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
  });
  const text = Buffer.from(result.result).toString("utf8");
  return text ? JSON.parse(text) : null;
}

export async function fetchTx(rpcUrl: string, txHash: string, senderId: string): Promise<TxOutcome> {
  return rpc<TxOutcome>(rpcUrl, "tx", {
    tx_hash: txHash,
    sender_account_id: senderId,
    wait_until: "EXECUTED",
  });
}

export async function provisionAccount(config: Config, accountId: string, publicKey: string): Promise<void> {
  if (!config.provisionAccounts) return;
  const exists = await accountExists(config.nearRpcUrl, accountId);
  if (exists) {
    const keys = await accessKeys(config.nearRpcUrl, accountId);
    if (!keys.includes(publicKey)) {
      throw Object.assign(new Error("that NEAR account already exists with a different key"), { statusCode: 409 });
    }
    return;
  }
  if (config.nearNetwork !== "testnet") {
    throw Object.assign(new Error("create the NEAR account before registering"), { statusCode: 400 });
  }
  const response = await fetch(config.faucetUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ newAccountId: accountId, newAccountPublicKey: publicKey }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw Object.assign(new Error(text || `faucet returned ${response.status}`), { statusCode: 502 });
  }
}

/** Sign `release` as the escrow owner. The operator key never leaves the server. */
export async function releaseOnNear(config: Config, emailHashHex: string, receiverId: string): Promise<TxOutcome> {
  const near = await import("near-api-js");
  const keyStore = new near.keyStores.InMemoryKeyStore();
  await keyStore.setKey(config.nearNetwork, config.operatorAccount, operatorKeyPair(near, config.operatorKey));
  const connection = await near.connect({
    networkId: config.nearNetwork,
    nodeUrl: config.nearRpcUrl,
    keyStore,
  });
  const signer = await connection.account(config.operatorAccount);
  return signer.functionCall({
    contractId: config.escrowAccount,
    methodName: "release",
    args: { email_hash: emailHashHex, receiver_id: receiverId },
    gas: RELEASE_GAS,
    attachedDeposit: 0n,
  });
}

function operatorKeyPair(near: typeof import("near-api-js"), secret: string): import("near-api-js").KeyPair {
  const trimmed = secret.trim();
  if (trimmed.startsWith("ed25519:") || trimmed.startsWith("secp256k1:")) {
    return near.KeyPair.fromString(trimmed as never);
  }
  const hex = trimmed.replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("NEAR_OPERATOR_KEY must be a NEAR key or a 32-byte hex secret");
  }
  return near.KeyPair.fromString(`secp256k1:${base58.encode(Buffer.from(hex, "hex"))}` as never);
}
