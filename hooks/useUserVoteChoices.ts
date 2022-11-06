import { useMemo } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { UserVoteChoicesInfo } from "@unloc-dev/unloc-sdk-voting";
import useSWR from "swr";

import {
  getUserVoteChoicesInfoKey,
  getVotingSessionKey,
  VOTING_PID,
} from "@utils/spl/unloc-voting";

const fetchUserChoicesInfo =
  (connection: Connection) => async (_: string, walletBase58: string) => {
    const wallet = new PublicKey(walletBase58);
    const sessionInfoKey = getVotingSessionKey(VOTING_PID);
    const voteChoicesKey = getUserVoteChoicesInfoKey(wallet, sessionInfoKey, VOTING_PID);

    return await UserVoteChoicesInfo.fromAccountAddress(connection, voteChoicesKey);
  };

export const USER_VOTE_CHOICES_KEY = "GET_USER_VOTE_CHOICES";

export const useUserVoteChoices = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const fetcher = useMemo(() => fetchUserChoicesInfo(connection), [connection]);

  const { mutate, data, error } = useSWR<UserVoteChoicesInfo>(
    () => (publicKey ? [USER_VOTE_CHOICES_KEY, publicKey?.toBase58()] : null),
    fetcher,
    {
      refreshInterval: 60000,
      errorRetryCount: 3,
    },
  );

  return {
    error,
    mutate,
    voteChoiceData: data,
  };
};
