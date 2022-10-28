import { useMemo } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { UserStakingsInfo } from "@unloc-dev/unloc-sdk-staking";
import useSWR, { MutatorCallback, MutatorOptions } from "swr";

// import { requestLogger } from "@utils/middleware";
import { getUserStakingsKey } from "@utils/spl/unloc-staking";

interface StakingAccountState {
  readonly address: PublicKey;
  info?: UserStakingsInfo;
}

export const GET_STAKING_ACCOUNTS_KEY = "GET_USER_STAKING_ACCOUNTS";

const fetchUserStakingAccounts =
  (connection: Connection) => async (_: string, walletBase58: string) => {
    const wallet = new PublicKey(walletBase58);
    const address = getUserStakingsKey(wallet);

    const info = await UserStakingsInfo.fromAccountAddress(connection, address, "confirmed");
    return { address, info };
  };

export const useStakingAccounts = (): {
  isLoading: boolean;
  mutate: (
    data?:
      | Promise<StakingAccountState>
      | MutatorCallback<StakingAccountState>
      | StakingAccountState,
    opts?: boolean | MutatorOptions<StakingAccountState>,
  ) => Promise<StakingAccountState | undefined>;
  isError: Error | undefined;
  accounts: StakingAccountState | undefined;
} => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const fetcher = useMemo(() => fetchUserStakingAccounts(connection), [connection]);

  const { error, data, mutate } = useSWR<StakingAccountState, Error>(
    publicKey != null ? [GET_STAKING_ACCOUNTS_KEY, publicKey.toString()] : null,
    fetcher,
    { refreshInterval: 45000, errorRetryCount: 3 },
  );

  return {
    accounts: data,
    isLoading: error == null && data == null,
    isError: error,
    mutate,
  };
};
