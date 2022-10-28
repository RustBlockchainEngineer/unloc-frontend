import { useCallback, useContext } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Commitment, RpcResponseAndContext, SignatureResult, Transaction } from "@solana/web3.js";

import { StoreContext } from "@pages/_app";

interface SendTransactionReturnType {
  signature: string;
  result: RpcResponseAndContext<SignatureResult>;
}

interface SendTransactionOptions {
  commitment?: Commitment;
  skipPreflight?: boolean;
}

export const useSendTransaction = (): ((
  transaction: Transaction,
  opts?: SendTransactionOptions,
) => Promise<SendTransactionReturnType>) => {
  const { GlobalState } = useContext(StoreContext);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  return useCallback(
    async (transaction: Transaction, opts?: SendTransactionOptions) => {
      if (publicKey === null) throw new WalletNotConnectedError();

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
        skipPreflight: opts?.skipPreflight ? opts.skipPreflight : GlobalState.skipPreflight,
      });

      console.log(signature);

      const result = await connection.confirmTransaction(
        { blockhash, lastValidBlockHeight, signature },
        opts?.commitment ? opts.commitment : GlobalState.selectedCommitment,
      );

      return { signature, result };
    },
    [
      GlobalState.selectedCommitment,
      GlobalState.skipPreflight,
      publicKey,
      connection,
      sendTransaction,
    ],
  );
};
