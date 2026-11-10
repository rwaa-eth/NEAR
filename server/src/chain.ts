import { base, baseSepolia, type Chain } from "viem/chains";

export type WalletNetwork = "mainnet" | "testnet";

export function walletNetwork(value: string | undefined, name: string): WalletNetwork {
  const network = (value ?? "").trim().toLowerCase() || "testnet";
  if (network !== "mainnet" && network !== "testnet") {
    throw new Error(`${name} must be mainnet or testnet`);
  }
  return network;
}

export function evmChain(network: WalletNetwork): Chain {
  return network === "mainnet" ? base : baseSepolia;
}

export function evmChainName(network: WalletNetwork): string {
  return network === "mainnet" ? "Base" : "Base Sepolia";
}

export function evmExplorer(network: WalletNetwork): string {
  return network === "mainnet" ? "https://basescan.org" : "https://sepolia.basescan.org";
}

export function evmDefaultRpc(network: WalletNetwork): string {
  return network === "mainnet" ? "https://mainnet.base.org" : "https://sepolia.base.org";
}
