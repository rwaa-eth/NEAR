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
  relayerAccount: string;
  relayerKey: string;
  baseRpcUrl: string;
  erc20Address: string;
  erc20Symbol: string;
  basePaymaster: boolean;
  escrowAddress: string;
  escrowOperatorKey: string;
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
  return {
    port: Number(env.PORT ?? 8080),
    token: env.STATIC_API_TOKEN ?? "dev-token-change-me",
    rpId: env.RP_ID ?? "rwaa.percolate.one",
    origin,
    origins,
    sqlitePath: env.SQLITE_PATH ?? "data/rwaa.sqlite",
    packageName: env.PACKAGE_NAME ?? "one.percolate.maplogger",
    fingerprints,
    nearNetwork: env.NEAR_NETWORK ?? "testnet",
    nearRpcUrl: env.NEAR_RPC_URL ?? "https://rpc.testnet.near.org",
    relayerAccount: env.NEAR_RELAYER_ACCOUNT ?? "",
    relayerKey: env.NEAR_RELAYER_KEY ?? "",
    baseRpcUrl: env.BASE_RPC_URL ?? "https://sepolia.base.org",
    erc20Address: (env.ERC20_ADDRESS ?? "").trim(),
    erc20Symbol: (env.ERC20_SYMBOL ?? "USDT").trim() || "USDT",
    basePaymaster: env.BASE_PAYMASTER === "true" || env.BASE_PAYMASTER === "1",
    escrowAddress: (env.ESCROW_ADDRESS ?? "").trim(),
    escrowOperatorKey: (env.ESCROW_OPERATOR_KEY ?? "").trim(),
  };
}
