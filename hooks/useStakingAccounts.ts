import { useMemo } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { UserStakingsInfo } from "@unloc-dev/unloc-sdk-staking";
import useSWR from "swr";

import { requestLogger } from "@utils/middleware";
import { getUserStakingsKey } from "@utils/spl/unloc-staking";

type StakingAccountState = {
  readonly address: PublicKey;
  info?: UserStakingsInfo;
};

const GET_STAKING_ACCOUNTS_KEY = "GET_USER_STAKING_ACCOUNTS";

const fetchUserStakingAccounts =
  (connection: Connection) => async (_: string, walletBase58: string) => {
    const wallet = new PublicKey(walletBase58);
    const address = getUserStakingsKey(wallet);

    const info = await UserStakingsInfo.fromAccountAddress(connection, address, "confirmed");
    return { address, info };
  };

export const useStakingAccounts = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const fetcher = useMemo(() => fetchUserStakingAccounts(connection), [connection]);

  const { error, data, mutate } = useSWR<StakingAccountState, Error>(
    publicKey ? [GET_STAKING_ACCOUNTS_KEY, publicKey.toString()] : null,
    fetcher,
    { refreshInterval: 45000, use: [requestLogger], errorRetryCount: 3 },
  );

  return {
    accounts: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
