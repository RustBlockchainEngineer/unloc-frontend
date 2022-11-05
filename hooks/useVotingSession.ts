import { useMemo } from "react";

import { useConnection } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { VoteSessionInfo } from "@unloc-dev/unloc-sdk-voting";
import useSWR from "swr";

import { UNLOC_VOTING_PID } from "@constants/config";
import { getVotingSessionKey } from "@utils/spl/unloc-voting";

const GET_VOTING_SESSION_KEY = "GET_VOTING_SESSION_INFO";

const fetchVotingSessionInfo = (connection: Connection) => async () => {
  const votingSessionKey = getVotingSessionKey(UNLOC_VOTING_PID);

  return await VoteSessionInfo.fromAccountAddress(connection, votingSessionKey);
};

export const useVotingSession = () => {
  const { connection } = useConnection();
  const fetcher = useMemo(() => fetchVotingSessionInfo(connection), [connection]);

  const { error, data } = useSWR<VoteSessionInfo, Error>(GET_VOTING_SESSION_KEY, fetcher, {
    refreshInterval: 120000,
    errorRetryCount: 3,
  });

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  };
};
