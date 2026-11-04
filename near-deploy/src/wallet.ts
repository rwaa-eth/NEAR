import { base58 } from "@scure/base";
import { KeyPair, type KeyPairString } from "near-api-js";
import { privateKeyToAccount } from "viem/accounts";
import { operatorKey } from "./env";

export type OperatorWallet = {
  /** Lowercase Ethereum address. This is the account id near-connect's Ethereum wallet signs in as. */
  ethAccountId: `0x${string}`;
  /** Named testnet account controlled by the same secp256k1 key. This one can deploy contracts. */
  accountId: string;
  /** Full-access public key registered on accountId. The secret stays in server/.env. */
  publicKey: string;
};

export function operatorWallet(accountId?: string): OperatorWallet {
  const secretHex = operatorKey().slice(2);
  const ethAccountId = privateKeyToAccount(`0x${secretHex}`).address.toLowerCase() as `0x${string}`;
  const encoded = base58.encode(Buffer.from(secretHex, "hex"));
  const keyPair = KeyPair.fromString(`secp256k1:${encoded}` as KeyPairString);
  const suffix = ethAccountId.slice(2, 10);
  return {
    ethAccountId,
    accountId: accountId ?? `rwaa${suffix}.testnet`,
    publicKey: keyPair.getPublicKey().toString(),
  };
}
