import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { evmChain, evmDefaultRpc, walletNetwork } from "../src/chain";
import { loadEnvFile, operatorKey } from "./load-env";

loadEnvFile();

const network = walletNetwork(process.env.EVM_NETWORK, "EVM_NETWORK");
const token = (process.env.ERC20_ADDRESS ?? "").trim();
const rpc = (process.env.BASE_RPC_URL ?? "").trim() || evmDefaultRpc(network);
const chain = evmChain(network);

if (!/^0x[0-9a-fA-F]{40}$/.test(token)) {
  throw new Error("Set ERC20_ADDRESS to the demo token before deploying escrow.");
}
const key = operatorKey();

const source = fs.readFileSync(path.join(__dirname, "..", "..", "contracts", "EmailEscrow.sol"), "utf8");
const compiled = JSON.parse(
  solc.compile(
    JSON.stringify({
      language: "Solidity",
      sources: { "EmailEscrow.sol": { content: source } },
      settings: {
        optimizer: { enabled: true, runs: 200 },
        outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } },
      },
    }),
  ),
) as {
  errors?: Array<{ severity: string; formattedMessage: string }>;
  contracts?: { "EmailEscrow.sol": { EmailEscrow: { evm: { bytecode: { object: string } } } } };
};

const errors = (compiled.errors ?? []).filter((error) => error.severity === "error");
if (errors.length > 0 || !compiled.contracts) {
  throw new Error(errors.map((error) => error.formattedMessage).join("\n") || "solc produced no bytecode");
}

const bytecode = compiled.contracts["EmailEscrow.sol"].EmailEscrow.evm.bytecode.object;
  const account = privateKeyToAccount(key);
const transport = http(rpc);
const wallet = createWalletClient({ account, chain, transport });
const reader = createPublicClient({ chain, transport });

async function main(): Promise<void> {
  const hash = await wallet.deployContract({
    abi: [
      {
        type: "constructor",
        stateMutability: "nonpayable",
        inputs: [
          { name: "token_", type: "address" },
          { name: "operator_", type: "address" },
        ],
      },
    ],
    bytecode: `0x${bytecode}`,
    args: [token as `0x${string}`, account.address],
  });
  const receipt = await reader.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error("deploy transaction did not create a contract");
  console.log(`ESCROW_ADDRESS=${receipt.contractAddress}`);
  console.log(`operator ${account.address}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
