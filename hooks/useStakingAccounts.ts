import { useMemo } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { FarmPoolUserAccount } from "@unloc-dev/unloc-staking-solita";
import useSWR from "swr";

import { requestLogger } from "@utils/middleware";
import { GmaBuilder } from "@utils/spl/GmaBuilder";
import { getUserStakingsKey } from "@utils/spl/unloc-staking";

type StakingAccountState = {
  readonly address: PublicKey;
  assigned: boolean;
  info?: FarmPoolUserAccount;
};

const GET_STAKING_ACCOUNTS_KEY = "GET_USER_STAKING_ACCOUNTS";

const fetchUserStakingAccounts =
  (connection: Connection) => async (_: string, walletBase58: string) => {
    const wallet = new PublicKey(walletBase58);
    const farmPoolAddresses = getUserStakingsKey(wallet);
    const accounts = await GmaBuilder.make(connection, [farmPoolAddresses]).get();

    return accounts.map((maybeAccount) => ({
      address: maybeAccount.publicKey,
      assigned: maybeAccount.exists,
      info: maybeAccount.exists ? FarmPoolUserAccount.deserialize(maybeAccount.data)[0] : undefined,
    }));
  };

export const useStakingAccounts = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const fetcher = useMemo(() => fetchUserStakingAccounts(connection), [connection]);

  const { error, data, mutate } = useSWR<StakingAccountState[], Error>(
    publicKey ? [GET_STAKING_ACCOUNTS_KEY, publicKey.toString()] : null,
    fetcher,
    { refreshInterval: 45000, use: [requestLogger] },
  );

  return {
    accounts: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};