import { useCallback, useContext } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Commitment, Transaction } from "@solana/web3.js";

import { StoreContext } from "@pages/_app";

export const useSendTransaction = (): ((
  transaction: Transaction,
  commitment?: Commitment,
  skipPreflight?: boolean,
) => Promise<void>) => {
  const store = useContext(StoreContext);
  const { selectedCommitment } = store.GlobalState;
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  return useCallback(
    async (
      transaction: Transaction,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      commitment = selectedCommitment as Commitment,
      skipPreflight?: boolean,
    ) => {
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

      await connection.confirmTransaction(
        { blockhash, lastValidBlockHeight, signature },
        commitment,
      );
    },
    [selectedCommitment, publicKey, connection, sendTransaction],
  );
};
