import type { Config } from "./config";
import { P256_FACTORY_ID, type PasskeyPublicKey } from "./accountId";

export interface RelayerResult {
  submitted: boolean;
  reason?: string;
  txHash?: string;
}

/**
 * The deterministic account id does not require this call. When a relayer key is
 * set, submit the NEP-616 init if the installed NEAR library can encode it.
 * near-api-js 5.1 has no DeterministicStateInit action, so a configured relayer
 * reports that instead of broadcasting a malformed transaction.
 */
export async function initPasskeyAccount(config: Config, accountId: string, _publicKey: PasskeyPublicKey): Promise<RelayerResult> {
  if (!config.relayerAccount || !config.relayerKey) {
    return { submitted: false, reason: "relayer is not configured" };
  }
  const near = await import("near-api-js");
  const transactions = near as unknown as { transactions?: Record<string, unknown> };
  const factory = transactions.transactions?.deterministicStateInit;
  if (typeof factory !== "function") {
    return {
      submitted: false,
      reason: `near-api-js cannot encode DeterministicStateInit for ${accountId} on ${P256_FACTORY_ID}`,
    };
  }
  try {
    const keyStore = new near.keyStores.InMemoryKeyStore();
    const keyPair = near.KeyPair.fromString(config.relayerKey as never);
    await keyStore.setKey(config.nearNetwork, config.relayerAccount, keyPair);
    const connection = await near.connect({
      networkId: config.nearNetwork,
      nodeUrl: config.nearRpcUrl,
      keyStore,
    });
    const relayer = await connection.account(config.relayerAccount);
    const outcome = await relayer.signAndSendTransaction({
      receiverId: accountId,
      actions: [factory({ accountId })],
    });
    return { submitted: true, txHash: outcome.transaction.hash };
  } catch (error) {
    const message = error instanceof Error ? error.message : "relayer failed";
    return { submitted: false, reason: message };
  }
}
