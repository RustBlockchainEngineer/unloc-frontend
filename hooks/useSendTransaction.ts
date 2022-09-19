import { useCallback } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Commitment, RpcResponseAndContext, SignatureResult, Transaction } from "@solana/web3.js";

type SendTransactionReturnType = {
  signature: string;
  result: RpcResponseAndContext<SignatureResult>;
};

export const useSendTransaction = (): ((
  transaction: Transaction,
  commitment?: Commitment,
  skipPreflight?: boolean,
) => Promise<SendTransactionReturnType>) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const sendAndConfirm = useCallback(
    async (transaction: Transaction, commitment?: Commitment, skipPreflight?: boolean) => {
      if (!publicKey) throw new WalletNotConnectedError();

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
        skipPreflight,
      });

      console.log(signature);

      const result = await connection.confirmTransaction(
        { blockhash, lastValidBlockHeight, signature },
        commitment,
      );

      return { signature, result };
    },
    [publicKey, sendTransaction, connection],
  );

  return sendAndConfirm;
};
