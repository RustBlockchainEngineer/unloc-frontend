import { useContext } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { observer } from "mobx-react-lite";

import { useSendTransaction } from "@hooks/useSendTransaction";
import { StoreContext } from "@pages/_app";
import { reallocUserAccount } from "@utils/spl/unloc-staking";

export const StakeActions = observer(() => {
  // const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { Lightbox, StakingStore } = useContext(StoreContext);
  const sendAndConfirm = useSendTransaction();
  const handleNewStake = (): void => {
    Lightbox.setVisible(false);
    // Reset the inputs
    StakingStore.resetCreateFormInputs();
    Lightbox.setContent("createStake");
    Lightbox.setVisible(true);
  };

  // const handleClaimRewards = async (): Promise<void> => {
  //   if (wallet == null) throw new WalletNotConnectedError();
  //   const tx = await withdrawTokens(connection, wallet, {
  //     withType: WithdrawType.LiqMining,
  //     index: 0,
  //   });
  //   await sendAndConfirm(tx, { skipPreflight: true });
  // };
  const handleReallocUserAccount = async (): Promise<void> => {
    if (wallet == null) throw new WalletNotConnectedError();

    const tx = await reallocUserAccount(wallet);
    await sendAndConfirm(tx, { skipPreflight: true });
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
          Claim Rewards
        </button>
        {/* <button onClick={handleClaimRewards} className="btn btn--md btn--bordered">
          Claim Rewards
        </button> */}
      </div>
    </article>
  );
});
