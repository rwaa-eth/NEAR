export interface Config {
  port: number;
  token: string;
  rpId: string;
  origin: string;
  origins: string[];
  sqlitePath: string;
  packageName: string;
  fingerprints: string[];
  nearNetwork: "mainnet" | "testnet";
  nearRpcUrl: string;
  faucetUrl: string;
  provisionAccounts: boolean;
  relayerAccount: string;
  relayerKey: string;
  tokenAccount: string;
  tokenSymbol: string;
  tokenDecimals: number;
  escrowAccount: string;
  operatorAccount: string;
  operatorKey: string;
  /** Spendable NEAR a wallet is filled to, in yoctoNEAR. */
  nearAccountBalance: bigint;
  /** Refill when spendable NEAR is at or below this, in yoctoNEAR. */
  nearTopupMinimum: bigint;
  emailFrom: string;
  resendApiKey: string;
  smtpUrl: string;
  emailDevMode: boolean;
  invitePassword: string;
}

function walletNetwork(value: string | undefined): "mainnet" | "testnet" {
  const network = (value ?? "").trim().toLowerCase() || "testnet";
  if (network !== "mainnet" && network !== "testnet") {
    throw new Error("NEAR_NETWORK must be mainnet or testnet");
  }
  return network;
}

function parseNear(value: string | undefined, fallback: string, name: string): bigint {
  const raw = (value ?? "").trim() || fallback;
  if (!/^\d+(\.\d{1,24})?$/.test(raw)) throw new Error(`${name} must be a NEAR amount`);
  const [whole, frac = ""] = raw.split(".");
  return BigInt(whole) * 10n ** 24n + BigInt(frac.padEnd(24, "0"));
}

function androidOrigin(fingerprint: string): string {
  const raw = Buffer.from(fingerprint.replace(/:/g, ""), "hex");
  if (raw.length !== 32) throw new Error(`SHA256_CERT_FINGERPRINT must be 32 bytes: ${fingerprint}`);
  return `android:apk-key-hash:${raw.toString("base64url")}`;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const origin = env.ORIGIN ?? "https://rwaa.percolate.one";
  const fingerprints = (env.SHA256_CERT_FINGERPRINT ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const origins = [origin, ...fingerprints.map(androidOrigin)];
  const decimals = Number(env.NEAR_TOKEN_DECIMALS ?? 6);
  const nearAccountBalance = parseNear(env.NEAR_ACCOUNT_BALANCE, "0.05", "NEAR_ACCOUNT_BALANCE");
  const nearTopupMinimum = parseNear(env.NEAR_TOPUP_MINIMUM, "0.01", "NEAR_TOPUP_MINIMUM");
  if (nearTopupMinimum >= nearAccountBalance) {
    throw new Error("NEAR_TOPUP_MINIMUM must be below NEAR_ACCOUNT_BALANCE");
  }
  const nearNetwork = walletNetwork(env.NEAR_NETWORK);
  const nearRpcUrl =
    (env.NEAR_RPC_URL ?? "").trim() ||
    (nearNetwork === "mainnet" ? "https://free.rpc.fastnear.com" : "https://rpc.testnet.fastnear.com");
  return {
    port: Number(env.PORT ?? 8099),
    token: env.STATIC_API_TOKEN ?? "dev-token-change-me",
    rpId: env.RP_ID ?? "rwaa.percolate.one",
    origin,
    origins,
    sqlitePath: env.SQLITE_PATH ?? "data/rwaa.sqlite",
    packageName: env.PACKAGE_NAME ?? "one.percolate.maplogger",
    fingerprints,
    nearNetwork,
    nearRpcUrl,
    faucetUrl: env.NEAR_FAUCET_URL ?? "https://helper.nearprotocol.com/account",
    provisionAccounts: env.NEAR_PROVISION_ACCOUNTS !== "false" && env.NEAR_PROVISION_ACCOUNTS !== "0",
    relayerAccount: env.NEAR_RELAYER_ACCOUNT ?? "",
    relayerKey: env.NEAR_RELAYER_KEY ?? "",
    tokenAccount: (env.NEAR_TOKEN_ACCOUNT ?? "").trim(),
    tokenSymbol: (env.NEAR_TOKEN_SYMBOL ?? "USDT").trim() || "USDT",
    tokenDecimals: Number.isInteger(decimals) && decimals >= 0 && decimals <= 24 ? decimals : 6,
    escrowAccount: (env.NEAR_ESCROW_ACCOUNT ?? "").trim(),
    operatorAccount: (env.NEAR_OPERATOR_ACCOUNT ?? "").trim(),
    operatorKey: (env.NEAR_RCV_KEY ?? env.NEAR_OPERATOR_KEY ?? "").trim(),
    nearAccountBalance,
    nearTopupMinimum,
    emailFrom: (env.EMAIL_FROM ?? "RaOpenwallet <noreply@raopenwallet.org>").trim(),
    resendApiKey: (env.RESEND_API_KEY ?? "").trim(),
    smtpUrl: (env.SMTP_URL ?? "").trim(),
    emailDevMode: env.EMAIL_DEV_MODE === "true" || env.EMAIL_DEV_MODE === "1",
    invitePassword: (env.INVITE_PASSWORD ?? "").trim(),
  };
}
