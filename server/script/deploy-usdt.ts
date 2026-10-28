import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { loadEnvFile, operatorKey } from "./load-env";

loadEnvFile();

const contractsDir = path.join(__dirname, "..", "..", "contracts");
const nodeModules = path.join(__dirname, "..", "node_modules");
const rpc = process.env.BASE_RPC_URL ?? "https://sepolia.base.org";

function findImports(importPath: string): { contents: string } | { error: string } {
  const normalized = path.normalize(importPath);
  const file = path.join(nodeModules, normalized);
  if (!fs.existsSync(file)) return { error: `File not found: ${importPath}` };
  return { contents: fs.readFileSync(file, "utf8") };
}

const source = fs.readFileSync(path.join(contractsDir, "TestUSDT.sol"), "utf8");
const compiled = JSON.parse(
  solc.compile(
    JSON.stringify({
      language: "Solidity",
      sources: { "TestUSDT.sol": { content: source } },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
      },
    }),
    { import: findImports },
  ),
) as {
  errors?: Array<{ severity: string; formattedMessage: string }>;
  contracts?: { "TestUSDT.sol": { TestUSDT: { evm: { bytecode: { object: string } } } } };
};

const errors = (compiled.errors ?? []).filter((error) => error.severity === "error");
if (errors.length > 0 || !compiled.contracts) {
  throw new Error(errors.map((error) => error.formattedMessage).join("\n") || "solc produced no bytecode");
}

const bytecode = compiled.contracts["TestUSDT.sol"].TestUSDT.evm.bytecode.object;

async function main(): Promise<void> {
  const account = privateKeyToAccount(operatorKey());
  const transport = http(rpc);
  const wallet = createWalletClient({ account, chain: baseSepolia, transport });
  const reader = createPublicClient({ chain: baseSepolia, transport });
  const hash = await wallet.deployContract({
    abi: [
      {
        type: "constructor",
        stateMutability: "nonpayable",
        inputs: [{ name: "initialOwner", type: "address" }],
      },
    ],
    bytecode: `0x${bytecode}`,
    args: [account.address],
  });
  const receipt = await reader.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error("deploy transaction did not create a contract");
  console.log(`ERC20_ADDRESS=${receipt.contractAddress}`);
  console.log(`owner ${account.address}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
