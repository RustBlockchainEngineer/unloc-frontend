import { useSendTransaction } from "@hooks/useSendTransaction";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { VoteChoice } from "@unloc-dev/unloc-sdk-voting";
import { voteCollections } from "@utils/spl/unloc-voting";
import { observer } from "mobx-react-lite";

export const VotingView = observer(() => {
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();

  const handleVote = async () => {
    if (!wallet) throw new WalletNotConnectedError();

    //params - frontend binding is needed
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
