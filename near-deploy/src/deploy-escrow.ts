import fs from "node:fs";
import path from "node:path";
import { base58 } from "@scure/base";
import { KeyPair, type KeyPairString } from "near-api-js";
import { loadServerEnv, operatorKey } from "./env";
import { operatorWallet } from "./wallet";

const RPC = "https://rpc.testnet.near.org";
const WASM = path.join(
  __dirname,
  "..",
  "..",
  "contracts",
  "near-escrow",
  "target",
  "wasm32-unknown-unknown",
  "release",
  "near_escrow.wasm",
);
const FUND = 4n * 10n ** 24n;
const EMPTY_CODE = "11111111111111111111111111111111";

type AccountView = {
  amount?: string;
  code_hash?: string;
  storage_usage?: number;
};

type ViewResponse = {
  result?: AccountView;
  error?: { cause?: { name?: string; info?: { response?: string } }; message?: string };
};

function keyPair(): KeyPair {
  const encoded = base58.encode(Buffer.from(operatorKey().slice(2), "hex"));
  return KeyPair.fromString(`secp256k1:${encoded}` as KeyPairString);
}

async function viewAccount(accountId: string): Promise<AccountView | undefined> {
  const response = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "view-account",
      method: "query",
      params: { request_type: "view_account", finality: "final", account_id: accountId },
    }),
  });
  const body = (await response.json()) as ViewResponse;
  if (body.error?.cause?.name === "UNKNOWN_ACCOUNT") return undefined;
  if (body.error) {
    throw new Error(body.error.cause?.info?.response ?? body.error.message ?? "account query failed");
  }
  return body.result;
}

function txHash(outcome: { transaction?: { hash?: string } }): string {
  return outcome.transaction?.hash ?? "(no hash)";
}

async function main(): Promise<void> {
  loadServerEnv();
  const wallet = operatorWallet();
  const escrowId = `escrow.${wallet.accountId}`;
  if (!fs.existsSync(WASM)) throw new Error(`Missing wasm. Build contracts/near-escrow first: ${WASM}`);

  const parent = await viewAccount(wallet.accountId);
  if (!parent?.amount) throw new Error(`${wallet.accountId} is not on testnet`);
  const locked = BigInt(parent.storage_usage ?? 0) * 10n ** 19n;
  const free = BigInt(parent.amount) - locked;
  if (free < FUND + 10n ** 23n) {
    throw new Error(`${wallet.accountId} has too little free NEAR to fund ${escrowId}`);
  }

  const near = await import("near-api-js");
  const keyStore = new near.keyStores.InMemoryKeyStore();
  const pair = keyPair();
  await keyStore.setKey("testnet", wallet.accountId, pair);
  await keyStore.setKey("testnet", escrowId, pair);
  const connection = await near.connect({ networkId: "testnet", nodeUrl: RPC, keyStore });

  const existing = await viewAccount(escrowId);
  if (!existing) {
    const creator = await connection.account(wallet.accountId);
    const created = await creator.createAccount(escrowId, wallet.publicKey, FUND);
    console.log(`created ${escrowId}`);
    console.log(`fund tx ${txHash(created)}`);
  } else {
    console.log(`${escrowId} already exists`);
  }

  const funded = await viewAccount(escrowId);
  if (funded?.code_hash && funded.code_hash !== EMPTY_CODE) {
    console.log(`${escrowId} already has contract code ${funded.code_hash}`);
    console.log(`NEAR_ESCROW_ACCOUNT=${escrowId}`);
    return;
  }

  const code = fs.readFileSync(WASM);
  const escrow = await connection.account(escrowId);
  const deployed = await escrow.signAndSendTransaction({
    receiverId: escrowId,
    actions: [
      near.transactions.deployContract(code),
      near.transactions.functionCall(
        "new",
        { owner_id: wallet.accountId, token_id: wallet.accountId },
        250_000_000_000_000n,
        0n,
      ),
    ],
  });
  console.log(`deployed escrow to ${escrowId}`);
  console.log(`owner ${wallet.accountId}`);
  console.log(`token ${wallet.accountId}`);
  console.log(`deploy tx ${txHash(deployed)}`);
  console.log(`NEAR_ESCROW_ACCOUNT=${escrowId}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
