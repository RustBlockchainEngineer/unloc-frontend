import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { VoteChoice } from "@unloc-dev/unloc-sdk-voting";
import { observer } from "mobx-react-lite";

import { useSendTransaction } from "@hooks/useSendTransaction";
import { voteCollections } from "@utils/spl/unloc-voting";

export const VotingView = observer(() => {
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();

  const handleVote = async (): Promise<void> => {
    if (wallet == null) throw new WalletNotConnectedError();

    // params - frontend binding is needed
    const choices: VoteChoice[] = [];

    const tx = await voteCollections(wallet, choices);
    await sendAndConfirm(tx, "confirmed", true);
  };

  return (
    <article className="stake__actions col">
      <button onClick={handleVote} className="btn btn--md btn--primary">
        Vote
      </button>
    </article>
  );
});
