import fs from "node:fs";
import path from "node:path";
import { KeyPair, type KeyPairString } from "near-api-js";
import { loadNearServerEnv, nearTokenAccount } from "./env";

const RPC = "https://free.rpc.fastnear.com";
const OPERATOR = "54327b2f304e8cbe502a432a591c0bc182881e681e38fad97d270d8c2a90a073";
const PARENT = "raopenwallet.near";
const ESCROW = "escrow.raopenwallet.near";
const PARENT_BALANCE = 3_200_000_000_000_000_000_000_000n;
const ESCROW_BALANCE = 2_800_000_000_000_000_000_000_000n;
const CREATE_GAS = 100_000_000_000_000n;
const INIT_GAS = 300_000_000_000_000n;
const EMPTY_CODE = "11111111111111111111111111111111";
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

type AccountView = { amount?: string; code_hash?: string };

function receiverKey(): KeyPairString {
  const secret = (process.env.NEAR_RCV_KEY ?? "").trim();
  if (!secret.startsWith("ed25519:")) {
    throw new Error("Set NEAR_RCV_KEY in near-server/.env to the ed25519 secret for the operator account.");
  }
  return secret as KeyPairString;
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
  const body = (await response.json()) as {
    result?: AccountView;
    error?: { cause?: { name?: string; info?: { response?: string } }; message?: string };
  };
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
  loadNearServerEnv();
  const tokenId = nearTokenAccount();
  if (!fs.existsSync(WASM)) throw new Error(`Missing wasm at ${WASM}`);
  const pair = KeyPair.fromString(receiverKey());
  const publicKey = pair.getPublicKey().toString();

  const near = await import("near-api-js");
  const keyStore = new near.keyStores.InMemoryKeyStore();
  for (const accountId of [OPERATOR, PARENT, ESCROW]) {
    await keyStore.setKey("mainnet", accountId, pair);
  }
  const connection = await near.connect({ networkId: "mainnet", nodeUrl: RPC, keyStore });
  const operator = await connection.account(OPERATOR);

  if (!(await viewAccount(PARENT))) {
    const created = await operator.functionCall({
      contractId: "near",
      methodName: "create_account",
      args: { new_account_id: PARENT, new_public_key: publicKey },
      gas: CREATE_GAS,
      attachedDeposit: PARENT_BALANCE,
    });
    console.log(`created ${PARENT}`);
    console.log(`create parent tx ${txHash(created)}`);
  } else {
    console.log(`${PARENT} already exists`);
  }

  const parent = await connection.account(PARENT);
  if (!(await viewAccount(ESCROW))) {
    const created = await parent.createAccount(ESCROW, publicKey, ESCROW_BALANCE);
    console.log(`created ${ESCROW}`);
    console.log(`create escrow tx ${txHash(created)}`);
  } else {
    console.log(`${ESCROW} already exists`);
  }

  const existing = await viewAccount(ESCROW);
  if (existing?.code_hash && existing.code_hash !== EMPTY_CODE) {
    console.log(`${ESCROW} already has contract code ${existing.code_hash}`);
    console.log(`NEAR_ESCROW_ACCOUNT=${ESCROW}`);
    return;
  }

  const code = fs.readFileSync(WASM);
  const escrow = await connection.account(ESCROW);
  const deployed = await escrow.signAndSendTransaction({
    receiverId: ESCROW,
    actions: [
      near.transactions.deployContract(code),
      near.transactions.functionCall("new", { owner_id: OPERATOR, token_id: tokenId }, INIT_GAS, 0n),
    ],
  });
  console.log(`deployed ${ESCROW}`);
  console.log(`owner ${OPERATOR}`);
  console.log(`token ${tokenId}`);
  console.log(`deploy tx ${txHash(deployed)}`);
  console.log(`NEAR_ESCROW_ACCOUNT=${ESCROW}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
