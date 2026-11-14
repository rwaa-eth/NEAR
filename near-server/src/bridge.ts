import type { Config } from "./config";
import { accountFunds, callView } from "./near";

const INTENTS_API = "https://1click.chaindefuser.com";
const WALLET_USDT_ACCOUNT = "usdt.tether-token.near";
const ORIGIN_ASSET = `nep141:${WALLET_USDT_ACCOUNT}`;
const DESTINATION_ASSET = "nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near";
const TRANSFER_GAS = 30_000_000_000_000n;
const STORAGE_GAS = 15_000_000_000_000n;
const TOKEN_STORAGE_DEPOSIT = 1_250_000_000_000_000_000_000n;
/** One transfer attaches 30 TGas, worth 0.003 NEAR, plus a little burn. */
const GAS_RESERVE = 5_000_000_000_000_000_000_000n;
const QUOTE_MS = 20 * 60 * 1000;

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
  timeEstimate: number;
  depositAddress?: string;
  /** Base units transferred on NEAR. Larger than `receiveAmount` by the bridge fee. */
  sendAmount: string;
};

type BridgeInput = {
  accountId: string;
  recipient: string;
  amount: string;
  commit?: boolean;
  /** `amount` is what the Ethereum address must receive. The transfer is raised by the fee. */
  exactOut?: boolean;
  /** Price the transfer without reading a wallet balance or creating a deposit. */
  quoteOnly?: boolean;
};

type IntentsQuote = {
  depositAddress?: string;
  depositMemo?: string | null;
  amountIn: string;
  amountOut: string;
  timeEstimate?: number;
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

/** USDT kept by NEAR Intents. The recipient gets `amountOut`. */
export function intentsFee(amountIn: bigint, amountOut: bigint): bigint {
  if (amountOut <= 0n || amountOut >= amountIn) return 0n;
  return amountIn - amountOut;
}

/**
 * Next amount to quote so a later transfer still delivers `target` after this
 * quote's shortfall. Returns null when this quote already covers the target.
 */
export function nextExactSend(target: bigint, sent: bigint, received: bigint): bigint | null {
  if (received >= target) return null;
  if (received <= 0n || received >= sent) return null;
  const next = sent + (target - received);
  return next > sent ? next : null;
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

async function hasStorage(rpcUrl: string, accountId: string): Promise<boolean> {
  const balance = await callView(rpcUrl, WALLET_USDT_ACCOUNT, "storage_balance_of", { account_id: accountId });
  return balance != null;
}

async function requestQuote(input: BridgeInput, amount: bigint, commit: boolean): Promise<IntentsQuote> {
  const response = await fetch(`${INTENTS_API}/v0/quote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      dry: !commit,
      swapType: "EXACT_INPUT",
      slippageTolerance: 100,
      originAsset: ORIGIN_ASSET,
      depositType: "ORIGIN_CHAIN",
      destinationAsset: DESTINATION_ASSET,
      amount: amount.toString(),
      recipient: input.recipient,
      recipientType: "DESTINATION_CHAIN",
      refundTo: input.accountId,
      refundType: "ORIGIN_CHAIN",
      deadline: new Date(Date.now() + QUOTE_MS).toISOString(),
    }),
  });
  const body = (await response.json()) as { message?: string; quote?: IntentsQuote };
  if (!response.ok || !body.quote?.amountIn || !body.quote.amountOut) {
    throw bridgeError(response.status === 400 ? 400 : 502, body.message || "could not price the bridge");
  }
  return body.quote;
}

export async function fetchIntentsStatus(depositAddress: string): Promise<string> {
  const response = await fetch(`${INTENTS_API}/v0/status?depositAddress=${encodeURIComponent(depositAddress)}`);
  const body = (await response.json().catch(() => ({}))) as { status?: string; message?: string };
  if (!response.ok || !body.status) {
    throw bridgeError(response.status === 404 ? 404 : 502, body.message || "could not read the bridge status");
  }
  return body.status;
}

/** The status API reports `SUCCESS` when the Ethereum transfer is done. */
export function bridgeRecordStatus(apiStatus: string): { status: string; done: boolean; complete: boolean } {
  const raw = apiStatus.trim().toUpperCase();
  if (raw === "SUCCESS" || raw === "COMPLETED") return { status: "completed", done: true, complete: true };
  if (raw === "REFUNDED" || raw === "FAILED") return { status: raw.toLowerCase(), done: true, complete: false };
  return { status: raw.toLowerCase() || "processing", done: false, complete: false };
}

export async function submitIntentsDeposit(depositAddress: string, txHash: string): Promise<void> {
  const response = await fetch(`${INTENTS_API}/v0/deposit/submit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ depositAddress, txHash }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw bridgeError(502, body.message || "could not confirm the bridge deposit");
  }
}

export async function prepareEthereumBridge(config: Config, input: BridgeInput): Promise<BridgePlan> {
  if (config.nearNetwork !== "mainnet") {
    throw bridgeError(400, "Bridging to Ethereum is available on NEAR mainnet.");
  }
  if (config.tokenAccount !== WALLET_USDT_ACCOUNT) {
    throw bridgeError(503, "Bridging expects usdt.tether-token.near.");
  }
  const requested = BigInt(input.amount);
  if (requested <= 0n) throw bridgeError(400, "Enter an amount greater than zero.");
  const minimum = 10n * 10n ** BigInt(config.tokenDecimals);
  if (requested < minimum) throw bridgeError(400, "The minimum bridge amount is 10 USDT.");

  const quoteAmount = async (amount: bigint, commit: boolean): Promise<IntentsQuote> => {
    try {
      return await requestQuote(input, amount, commit);
    } catch (error) {
      if (error instanceof Error && "statusCode" in error) throw error;
      throw bridgeError(502, error instanceof Error ? error.message : "could not price the bridge");
    }
  };
  const priced = (quote: IntentsQuote): { amountIn: bigint; amountOut: bigint } => {
    const amountIn = BigInt(quote.amountIn);
    const amountOut = BigInt(quote.amountOut);
    const tokenFee = intentsFee(amountIn, amountOut);
    if (amountOut <= 0n || tokenFee >= amountIn) throw bridgeError(400, "That amount is too small to bridge.");
    return { amountIn, amountOut };
  };

  let amount = requested;
  let quote = await quoteAmount(amount, Boolean(input.commit) && !input.exactOut);
  if (input.exactOut) {
    for (let cycle = 0; cycle < 4; cycle += 1) {
      const current = priced(quote);
      const next = nextExactSend(requested, current.amountIn, current.amountOut);
      if (next === null) break;
      amount = next;
      quote = await quoteAmount(amount, false);
    }
    const covered = priced(quote);
    if (covered.amountOut > requested) {
      const tighter = covered.amountIn - (covered.amountOut - requested);
      if (tighter > requested) {
        const trial = await quoteAmount(tighter, false);
        if (priced(trial).amountOut >= requested) quote = trial;
      }
    }
    if (input.commit) quote = await quoteAmount(priced(quote).amountIn, true);
    if (priced(quote).amountOut < requested) {
      const raised = nextExactSend(requested, priced(quote).amountIn, priced(quote).amountOut);
      if (raised !== null) {
        quote = await quoteAmount(raised, false);
        if (input.commit) quote = await quoteAmount(priced(quote).amountIn, true);
      }
    }
  }
  const { amountIn, amountOut } = priced(quote);
  const tokenFee = intentsFee(amountIn, amountOut);
  if (input.exactOut && amountOut < requested) throw bridgeError(502, "Could not cover the bridge fee.");

  const transactions: BridgeTransaction[] = [];
  if (input.commit) {
    const depositAddress = quote.depositAddress?.trim() ?? "";
    if (!/^[a-f0-9]{64}$/.test(depositAddress)) {
      throw bridgeError(502, "The bridge did not return a NEAR deposit account.");
    }
    if (!(await hasStorage(config.nearRpcUrl, depositAddress))) {
      transactions.push(
        callTransaction(
          WALLET_USDT_ACCOUNT,
          "storage_deposit",
          { account_id: depositAddress },
          STORAGE_GAS,
          TOKEN_STORAGE_DEPOSIT,
        ),
      );
    }
    transactions.push(
      callTransaction(
        WALLET_USDT_ACCOUNT,
        "ft_transfer",
        { receiver_id: depositAddress, amount: amountIn.toString(), memo: quote.depositMemo || null },
        TRANSFER_GAS,
        1n,
      ),
    );
  }

  let spendable = 0n;
  if (!input.quoteOnly) {
    try {
      spendable = BigInt((await accountFunds(config.nearRpcUrl, input.accountId)).spendable);
    } catch (error) {
      throw bridgeError(502, error instanceof Error ? error.message : "could not read the NEAR balance");
    }
  }
  const previewStorage = input.commit ? 0n : TOKEN_STORAGE_DEPOSIT;
  const required = depositTotal(transactions) + previewStorage + GAS_RESERVE;
  const affordable = spendable >= required;
  return {
    nativeFee: "0",
    tokenFee: tokenFee.toString(),
    receiveAmount: amountOut.toString(),
    swapOut: "0",
    bridgedToken: DESTINATION_ASSET,
    affordable,
    swapTransactions: [],
    transactions: affordable && input.commit ? transactions : [],
    timeEstimate: quote.timeEstimate ?? 30,
    depositAddress: input.commit ? quote.depositAddress : undefined,
    sendAmount: amountIn.toString(),
  };
}
