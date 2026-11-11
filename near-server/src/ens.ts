const ENS_NAME = /^[^\s@]+\.eth$/i;
const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export type EnsDirection = "forward" | "reverse";

export type EnsResult = {
  direction: EnsDirection;
  name: string | null;
  address: string | null;
};

export function classifyEns(value: string): EnsDirection | null {
  const query = value.trim();
  if (EVM_ADDRESS.test(query)) return "reverse";
  if (ENS_NAME.test(query)) return "forward";
  return null;
}

function ensError(statusCode: number, message: string): Error {
  return Object.assign(new Error(message), { statusCode });
}

export async function resolveEns(rpcUrl: string, value: string): Promise<EnsResult> {
  const direction = classifyEns(value);
  if (!direction) throw ensError(400, "Enter a .eth name or an Ethereum address.");
  const query = value.trim();
  const { createPublicClient, getAddress, http } = await import("viem");
  const { mainnet } = await import("viem/chains");
  const { normalize } = await import("viem/ens");
  const client = createPublicClient({ chain: mainnet, transport: http(rpcUrl) });
  const lookup = async (): Promise<EnsResult> => {
    if (direction === "forward") {
      const name = normalize(query);
      const address = await client.getEnsAddress({ name });
      return { direction, name, address };
    }
    const address = getAddress(query.toLowerCase());
    const name = await client.getEnsName({ address });
    return { direction, name, address };
  };
  try {
    try {
      return await lookup();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/invalid|normaliz/i.test(message)) throw error;
      return await lookup();
    }
  } catch (error) {
    if (error instanceof Error && "statusCode" in error) throw error;
    const message = error instanceof Error ? error.message : "";
    if (/invalid|normaliz/i.test(message)) throw ensError(400, "That is not a valid ENS name.");
    throw ensError(502, "Could not resolve that name on Ethereum.");
  }
}
