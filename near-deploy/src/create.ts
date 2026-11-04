import { loadServerEnv } from "./env";
import { operatorWallet } from "./wallet";

const RPC = "https://rpc.testnet.near.org";
const FAUCET = "https://helper.nearprotocol.com/account";

type ViewAccount = {
  result?: { amount?: string };
  error?: { name?: string; cause?: { name?: string; info?: { response?: string } } };
};

async function accountExists(accountId: string): Promise<{ exists: boolean; amount?: string }> {
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
  const body = (await response.json()) as ViewAccount;
  if (body.error?.cause?.name === "UNKNOWN_ACCOUNT") return { exists: false };
  if (body.error) {
    throw new Error(body.error.cause?.info?.response ?? body.error.name ?? "account query failed");
  }
  return { exists: true, amount: body.result?.amount };
}

function yoctoToNear(amount: string | undefined): string {
  if (!amount) return "0";
  const whole = BigInt(amount) / 10n ** 24n;
  const frac = (BigInt(amount) % 10n ** 24n).toString().padStart(24, "0").slice(0, 4);
  return `${whole}.${frac}`;
}

async function main(): Promise<void> {
  loadServerEnv();
  const requested = process.argv[2]?.trim();
  const wallet = operatorWallet(requested);
  console.log(`eth account  ${wallet.ethAccountId}`);
  console.log(`near account ${wallet.accountId}`);
  console.log(`public key   ${wallet.publicKey}`);

  const before = await accountExists(wallet.accountId);
  if (before.exists) {
    console.log(`already on testnet, balance ${yoctoToNear(before.amount)} NEAR`);
    return;
  }

  const created = await fetch(FAUCET, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      newAccountId: wallet.accountId,
      newAccountPublicKey: wallet.publicKey,
    }),
  });
  const text = await created.text();
  if (!created.ok) {
    throw new Error(`faucet ${created.status}: ${text}`);
  }
  console.log(text);

  const after = await accountExists(wallet.accountId);
  if (!after.exists) throw new Error("faucet accepted the request but the account is not on testnet yet");
  console.log(`created on testnet, balance ${yoctoToNear(after.amount)} NEAR`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
