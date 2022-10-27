import { useMemo } from "react";

import { useConnection } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { StakingPoolInfo } from "@unloc-dev/unloc-sdk-staking";
import useSWR from "swr";

import { UNLOC_STAKING_PID } from "@constants/config";
import { requestLogger } from "@utils/middleware";
import { getStakingPoolKey } from "@utils/spl/unloc-staking";

const GET_POOLINFO_KEY = "GET_POOLINFO_ACCOUNT";

const fetchPoolInfo = (connection: Connection) => async () => {
  const poolInfoKey = getStakingPoolKey(UNLOC_STAKING_PID);

  return await StakingPoolInfo.fromAccountAddress(connection, poolInfoKey);
};

export const usePoolInfo = (): {
  isLoading: boolean;
  isError: Error | undefined;
  data: StakingPoolInfo | undefined;
} => {
  const { connection } = useConnection();
  const fetcher = useMemo(() => fetchPoolInfo(connection), [connection]);

  const { error, data } = useSWR<StakingPoolInfo, Error>(GET_POOLINFO_KEY, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    use: [requestLogger],
    errorRetryCount: 3,
  });

  return {
    data,
    isLoading: error == null && data == null,
    isError: error,
  };
};
