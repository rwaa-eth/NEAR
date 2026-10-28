import { createPublicClient, createWalletClient, encodeFunctionData, formatUnits, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { loadEnvFile, operatorKey } from "./load-env";

loadEnvFile();

const token = (process.env.ERC20_ADDRESS ?? "").trim();
const rpc = process.env.BASE_RPC_URL ?? "https://sepolia.base.org";
const to = (process.argv[2] ?? "").trim();
const amountText = (process.argv[3] ?? "1000").trim();

const tokenAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

async function main(): Promise<void> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(to)) {
    throw new Error("Usage: npm run fund -- 0xWallet [amount]");
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(token)) {
    throw new Error("Set ERC20_ADDRESS in server/.env before minting.");
  }
  const units = parseUnits(amountText, 6);
  if (units <= 0n) throw new Error("Amount must be greater than zero.");

  const account = privateKeyToAccount(operatorKey());
  const transport = http(rpc);
  const wallet = createWalletClient({ account, chain: baseSepolia, transport });
  const reader = createPublicClient({ chain: baseSepolia, transport });
  const hash = await wallet.sendTransaction({
    to: token as `0x${string}`,
    data: encodeFunctionData({
      abi: tokenAbi,
      functionName: "mint",
      args: [to as `0x${string}`, units],
    }),
  });
  const receipt = await reader.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("mint reverted");
  const balance = await reader.readContract({
    address: token as `0x${string}`,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [to as `0x${string}`],
  });
  console.log(`minted ${amountText} USDT to ${to}`);
  console.log(`balance ${formatUnits(balance, 6)} USDT`);
  console.log(hash);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
