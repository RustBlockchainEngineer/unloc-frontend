import { useSendTransaction } from "@hooks/useSendTransaction";
import { StoreContext } from "@pages/_app";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WithdrawType } from "@unloc-dev/unloc-sdk-staking";
import { reallocUserAccount, withdrawTokens } from "@utils/spl/unloc-staking";
import { observer } from "mobx-react-lite";
import { useContext } from "react";

export const StakeActions = observer(() => {
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { Lightbox, StakingStore } = useContext(StoreContext);
  const sendAndConfirm = useSendTransaction();
  const handleNewStake = () => {
    Lightbox.setVisible(false);
    // Reset the inputs
    StakingStore.resetCreateFormInputs();
    Lightbox.setContent("createStake");
    Lightbox.setVisible(true);
  };

  const handleClaimRewards = async () => {
    if (!wallet) throw new WalletNotConnectedError();
    const tx = await withdrawTokens(connection, wallet, {
      withType: WithdrawType.LiqMining,
      index: 0,
    });
    await sendAndConfirm(tx, "confirmed", true);
  };
  const handleReallocUserAccount = async () => {
    if (!wallet) throw new WalletNotConnectedError();

    const tx = await reallocUserAccount(wallet);
    await sendAndConfirm(tx, "confirmed", true);
  };
  const handleMergeAccounts = async () => {
    if (!wallet) throw new WalletNotConnectedError();
    console.log("TODO");
  };

  return (
    <article className="stake__actions col">
      <div className="stake__plus">
        <span className="title">New staking account</span>
        <div className="add-new">
          <button type="button" className="button--plus" onClick={handleNewStake}>
            &#43;
          </button>
        </div>
      </div>
      <div className="separator" />
      <div className="stake__buttons">
        <button onClick={handleReallocUserAccount} className="btn btn--md btn--primary">
          Level Up
        </button>
        <button onClick={handleMergeAccounts} className="btn btn--md btn--primary">
          Merge Accounts
        </button>
        <button onClick={handleClaimRewards} className="btn btn--md btn--bordered">
          Claim Rewards
        </button>
      </div>
    </article>
  );
});
