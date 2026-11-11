import type { Config } from "./config";
import { accountFunds, callView } from "./near";

/** NEAR token Omni burns to unlock Ethereum USDT. Rhea pool 3689 swaps the wallet's USDT into this. */
export const ETH_USDT_ACCOUNT = "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near";
const WALLET_USDT_ACCOUNT = "usdt.tether-token.near";
const REF_EXCHANGE = "v2.ref-finance.near";
const REF_POOL = 3689;
const SWAP_GAS = 180_000_000_000_000n;
const CALL_GAS = 30_000_000_000_000n;
/** Headroom above Ref's 0.00102 NEAR minimum so both tokens can be registered. */
const REF_STORAGE_DEPOSIT = 5_000_000_000_000_000_000_000n;
const TOKEN_STORAGE_DEPOSIT = 1_250_000_000_000_000_000_000n;
/** Largest attached gas on the bridge transfer, plus earlier burn from the swap. */
const SWAP_PATH_GAS = 35_000_000_000_000_000_000_000n;
const BRIDGE_GAS = 30_000_000_000_000_000_000_000n;

export type BridgeAction = {
  methodName: string;
  args: string;
  gas: string;
  deposit: string;
};

export type BridgeTransaction = {
  receiverId: string;
  actions: BridgeAction[];
};

export type BridgePlan = {
  nativeFee: string;
  tokenFee: string;
  receiveAmount: string;
  swapOut: string;
  bridgedToken: string;
  affordable: boolean;
  swapTransactions: BridgeTransaction[];
  transactions: BridgeTransaction[];
};

type BridgeInput = {
  accountId: string;
  recipient: string;
  amount: string;
  bridgedAmount?: string;
};

function bridgeError(statusCode: number, message: string): Error {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

export function formatNear(yocto: bigint): string {
  const whole = yocto / 10n ** 24n;
  const frac = (yocto % 10n ** 24n).toString().padStart(24, "0").slice(0, 4).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

/** Pay the relayer in the bridged token. The NEAR quote is the same charge priced in NEAR. */
export function chooseBridgeFee(
  quote: { tokenFee: bigint; nativeFee: bigint; usdFee: number },
  decimals: number,
): { tokenFee: bigint; nativeFee: bigint } {
  if (quote.tokenFee > 0n) return { tokenFee: quote.tokenFee, nativeFee: 0n };
  if (quote.usdFee > 0 && decimals >= 0 && decimals <= 24) {
    return { tokenFee: usdToTokenUnits(quote.usdFee, decimals), nativeFee: 0n };
  }
  return { tokenFee: 0n, nativeFee: quote.nativeFee };
}

/** Keep one percent of slippage room. The bridge uses the amount the swap actually returns. */
export function minSwapOut(quoted: bigint): bigint {
  if (quoted <= 0n) return 0n;
  return (quoted * 99n) / 100n;
}

function usdToTokenUnits(usd: number, decimals: number): bigint {
  const [whole, frac = ""] = usd.toFixed(8).split(".");
  const digits = `${frac}${"0".repeat(decimals)}`.slice(0, decimals);
  const base = BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(digits || "0");
  return (base * 3n + 1n) / 2n;
}

function encodeTransaction(tx: {
  receiverId: string;
  actions: Array<{ type: string; methodName?: string; args?: Uint8Array; gas?: bigint; deposit?: bigint }>;
}): BridgeTransaction {
  return {
    receiverId: tx.receiverId,
    actions: tx.actions.map((action) => {
      if (action.type !== "FunctionCall" || !action.methodName || !action.args || action.gas === undefined || action.deposit === undefined) {
        throw bridgeError(502, "The bridge returned a transaction this wallet cannot sign.");
      }
      return {
        methodName: action.methodName,
        args: Buffer.from(action.args).toString("base64"),
        gas: action.gas.toString(),
        deposit: action.deposit.toString(),
      };
    }),
  };
}

function callTransaction(receiverId: string, methodName: string, args: object, gas: bigint, deposit: bigint): BridgeTransaction {
  return {
    receiverId,
    actions: [
      {
        methodName,
        args: Buffer.from(JSON.stringify(args)).toString("base64"),
        gas: gas.toString(),
        deposit: deposit.toString(),
      },
    ],
  };
}

function depositTotal(transactions: BridgeTransaction[]): bigint {
  return transactions.reduce(
    (sum, tx) => sum + tx.actions.reduce((inner, action) => inner + BigInt(action.deposit), 0n),
    0n,
  );
}

async function hasStorage(rpcUrl: string, contractId: string, accountId: string): Promise<boolean> {
  const balance = await callView(rpcUrl, contractId, "storage_balance_of", { account_id: accountId });
  return balance != null;
}

async function quoteRefSwap(rpcUrl: string, amount: bigint): Promise<bigint> {
  const pool = (await callView(rpcUrl, REF_EXCHANGE, "get_pool", { pool_id: REF_POOL })) as {
    token_account_ids?: string[];
  };
  const tokens = pool.token_account_ids ?? [];
  if (!tokens.includes(WALLET_USDT_ACCOUNT) || !tokens.includes(ETH_USDT_ACCOUNT)) {
    throw bridgeError(502, "The USDT swap pool is not available.");
  }
  const quoted = await callView(rpcUrl, REF_EXCHANGE, "get_return", {
    pool_id: REF_POOL,
    token_in: WALLET_USDT_ACCOUNT,
    amount_in: amount.toString(),
    token_out: ETH_USDT_ACCOUNT,
  });
  return BigInt(typeof quoted === "string" || typeof quoted === "number" ? quoted : 0);
}

async function buildSwap(config: Config, accountId: string, amount: bigint, minOut: bigint): Promise<BridgeTransaction[]> {
  const transactions: BridgeTransaction[] = [];
  if (!(await hasStorage(config.nearRpcUrl, REF_EXCHANGE, accountId))) {
    transactions.push(
      callTransaction(REF_EXCHANGE, "storage_deposit", { account_id: accountId }, CALL_GAS, REF_STORAGE_DEPOSIT),
    );
  }
  transactions.push(
    callTransaction(
      REF_EXCHANGE,
      "register_tokens",
      { token_ids: [WALLET_USDT_ACCOUNT, ETH_USDT_ACCOUNT] },
      CALL_GAS,
      1n,
    ),
  );
  if (!(await hasStorage(config.nearRpcUrl, ETH_USDT_ACCOUNT, accountId))) {
    transactions.push(
      callTransaction(ETH_USDT_ACCOUNT, "storage_deposit", { account_id: accountId }, CALL_GAS, TOKEN_STORAGE_DEPOSIT),
    );
  }
  transactions.push(
    callTransaction(
      config.tokenAccount,
      "ft_transfer_call",
      {
        receiver_id: REF_EXCHANGE,
        amount: amount.toString(),
        memo: null,
        msg: JSON.stringify({
          force: 0,
          actions: [
            {
              pool_id: REF_POOL,
              token_in: WALLET_USDT_ACCOUNT,
              token_out: ETH_USDT_ACCOUNT,
              amount_in: amount.toString(),
              min_amount_out: minOut.toString(),
            },
          ],
        }),
      },
      SWAP_GAS,
      1n,
    ),
  );
  return transactions;
}

async function buildBridge(
  config: Config,
  input: BridgeInput,
  amount: bigint,
): Promise<{ nativeFee: bigint; tokenFee: bigint; transactions: BridgeTransaction[] }> {
  const { BridgeAPI, ChainKind, ValidationError, createBridge } = await import("@omni-bridge/core");
  const { createNearBuilder } = await import("@omni-bridge/near");
  const bridge = createBridge({ network: "mainnet", rpcUrls: { [ChainKind.Near]: config.nearRpcUrl } });
  const api = new BridgeAPI("mainnet");
  const nearBuilder = createNearBuilder({ network: "mainnet", rpcUrl: config.nearRpcUrl });
  const token = `near:${ETH_USDT_ACCOUNT}` as const;
  const sender = `near:${input.accountId}` as const;
  const recipient = `eth:${input.recipient}` as const;

  let nativeFee = 0n;
  let tokenFee = 0n;
  try {
    const fee = await api.getFee(sender, recipient, token, amount);
    const chosen = chooseBridgeFee(
      {
        tokenFee: BigInt(fee.transferred_token_fee ?? "0"),
        nativeFee: fee.native_token_fee ?? 0n,
        usdFee: fee.usd_fee,
      },
      config.tokenDecimals,
    );
    nativeFee = chosen.nativeFee;
    tokenFee = chosen.tokenFee;
  } catch (error) {
    throw bridgeError(502, error instanceof Error ? error.message : "could not price the bridge");
  }
  if (tokenFee >= amount) throw bridgeError(400, "The bridge fee uses the whole amount.");

  let validated: Awaited<ReturnType<typeof bridge.validateTransfer>>;
  try {
    validated = await bridge.validateTransfer({
      token,
      amount,
      sender,
      recipient,
      fee: tokenFee,
      nativeFee,
    });
  } catch (error) {
    if (error instanceof ValidationError && error.code === "TOKEN_NOT_REGISTERED") {
      throw bridgeError(400, "Omni Bridge cannot deliver this USDT to Ethereum.");
    }
    if (error instanceof ValidationError && error.code === "AMOUNT_TOO_SMALL") {
      throw bridgeError(400, "That amount is too small to bridge.");
    }
    throw bridgeError(400, error instanceof Error ? error.message : "The bridge rejected this transfer.");
  }

  const transactions = [];
  const storage = await nearBuilder.getRequiredStorageDeposit(input.accountId);
  if (storage > 0n) transactions.push(nearBuilder.buildStorageDeposit(input.accountId, storage));
  const tokenReady = await nearBuilder.isTokenStorageRegistered(ETH_USDT_ACCOUNT);
  if (!tokenReady) transactions.push(await nearBuilder.buildTokenStorageDeposit(ETH_USDT_ACCOUNT, input.accountId));
  transactions.push(nearBuilder.buildTransfer(validated, input.accountId));
  return { nativeFee, tokenFee, transactions: transactions.map(encodeTransaction) };
}

export async function prepareEthereumBridge(config: Config, input: BridgeInput): Promise<BridgePlan> {
  if (config.nearNetwork !== "mainnet") {
    throw bridgeError(400, "Bridging to Ethereum is available on NEAR mainnet.");
  }
  if (!config.tokenAccount) throw bridgeError(503, "Set NEAR_TOKEN_ACCOUNT on the server.");
  const amount = BigInt(input.amount);
  if (amount <= 0n) throw bridgeError(400, "Enter an amount greater than zero.");
  const direct = config.tokenAccount === ETH_USDT_ACCOUNT;
  if (!direct && config.tokenAccount !== WALLET_USDT_ACCOUNT) {
    throw bridgeError(400, "This token cannot be swapped onto Ethereum USDT.");
  }
  const bridgedAmount = input.bridgedAmount ? BigInt(input.bridgedAmount) : null;
  if (bridgedAmount !== null && bridgedAmount <= 0n) throw bridgeError(400, "Enter an amount greater than zero.");

  const needsSwap = bridgedAmount === null && !direct;
  let swapOut = bridgedAmount ?? amount;
  let swapTransactions: BridgeTransaction[] = [];
  if (needsSwap) {
    let quoted = 0n;
    try {
      quoted = await quoteRefSwap(config.nearRpcUrl, amount);
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) throw error;
      throw bridgeError(502, error instanceof Error ? error.message : "could not price the swap");
    }
    const minOut = minSwapOut(quoted);
    if (minOut <= 0n) throw bridgeError(400, "That amount is too small to swap.");
    swapOut = quoted;
    swapTransactions = await buildSwap(config, input.accountId, amount, minOut);
  }

  const bridge = await buildBridge(config, input, swapOut);
  let spendable = 0n;
  try {
    spendable = BigInt((await accountFunds(config.nearRpcUrl, input.accountId)).spendable);
  } catch (error) {
    throw bridgeError(502, error instanceof Error ? error.message : "could not read the NEAR balance");
  }
  const required =
    depositTotal(swapTransactions) + depositTotal(bridge.transactions) + (needsSwap ? SWAP_PATH_GAS : BRIDGE_GAS);
  const affordable = spendable >= required;
  return {
    nativeFee: bridge.nativeFee.toString(),
    tokenFee: bridge.tokenFee.toString(),
    receiveAmount: (swapOut - bridge.tokenFee).toString(),
    swapOut: needsSwap ? swapOut.toString() : "0",
    bridgedToken: ETH_USDT_ACCOUNT,
    affordable,
    swapTransactions: affordable && needsSwap ? swapTransactions : [],
    transactions: affordable && !needsSwap ? bridge.transactions : [],
  };
}
