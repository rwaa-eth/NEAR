export interface Config {
  port: number;
  token: string;
  rpId: string;
  origin: string;
  origins: string[];
  sqlitePath: string;
  packageName: string;
  fingerprints: string[];
  nearNetwork: string;
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
  emailFrom: string;
  resendApiKey: string;
  smtpUrl: string;
  emailDevMode: boolean;
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
  return {
    port: Number(env.PORT ?? 8099),
    token: env.STATIC_API_TOKEN ?? "dev-token-change-me",
    rpId: env.RP_ID ?? "rwaa.percolate.one",
    origin,
    origins,
    sqlitePath: env.SQLITE_PATH ?? "data/rwaa.sqlite",
    packageName: env.PACKAGE_NAME ?? "one.percolate.maplogger",
    fingerprints,
    nearNetwork: env.NEAR_NETWORK ?? "testnet",
    nearRpcUrl: env.NEAR_RPC_URL ?? "https://rpc.testnet.near.org",
    faucetUrl: env.NEAR_FAUCET_URL ?? "https://helper.nearprotocol.com/account",
    provisionAccounts: env.NEAR_PROVISION_ACCOUNTS !== "false" && env.NEAR_PROVISION_ACCOUNTS !== "0",
    relayerAccount: env.NEAR_RELAYER_ACCOUNT ?? "",
    relayerKey: env.NEAR_RELAYER_KEY ?? "",
    tokenAccount: (env.NEAR_TOKEN_ACCOUNT ?? "").trim(),
    tokenSymbol: (env.NEAR_TOKEN_SYMBOL ?? "USDT").trim() || "USDT",
    tokenDecimals: Number.isInteger(decimals) && decimals >= 0 && decimals <= 24 ? decimals : 6,
    escrowAccount: (env.NEAR_ESCROW_ACCOUNT ?? "").trim(),
    operatorAccount: (env.NEAR_OPERATOR_ACCOUNT ?? "").trim(),
    operatorKey: (env.NEAR_OPERATOR_KEY ?? "").trim(),
    emailFrom: (env.EMAIL_FROM ?? "RaOpenwallet <noreply@raopenwallet.org>").trim(),
    resendApiKey: (env.RESEND_API_KEY ?? "").trim(),
    smtpUrl: (env.SMTP_URL ?? "").trim(),
    emailDevMode: env.EMAIL_DEV_MODE === "true" || env.EMAIL_DEV_MODE === "1",
  };
}
