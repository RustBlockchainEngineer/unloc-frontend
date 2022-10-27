import { Commitment, Connection, PublicKey } from "@solana/web3.js";

import { zipMap } from "@utils/common";
import { getUnparsedMaybeAccount, UnparsedMaybeAccount } from "@utils/spl/types";

/**
 * Wrapper around the web3.js getMultipleAccountsInfo query, left joins each public key with the returned info and unparsed data buffer.
 * If the account info wasn't found, the {@code exists} prop is set to false.
 *
 * @param connection Connection
 * @param publicKeys PublicKeys
 * @param commitment Solana commitment level
 * @returns UnparsedMaybeAccount[]
 */
export const getMultipleAccounts = async (
  connection: Connection,
  publicKeys: PublicKey[],
  commitment?: Commitment,
): Promise<UnparsedMaybeAccount[]> => {
  const accountInfos = await connection.getMultipleAccountsInfo(publicKeys, commitment);

  return zipMap(publicKeys, accountInfos, (publicKey, accountInfo) => {
    return getUnparsedMaybeAccount(publicKey, accountInfo);
  });
};
