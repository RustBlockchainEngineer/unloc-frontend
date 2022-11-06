import { useContext } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WithdrawType } from "@unloc-dev/unloc-sdk-staking";
import { observer } from "mobx-react-lite";

import { useSendTransaction } from "@hooks/useSendTransaction";
import { StoreContext } from "@pages/_app";
import { withdrawTokens } from "@utils/spl/unloc-staking";

export const StakeActions = observer(() => {
  const { connection } = useConnection();
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

  const handleClaimRewards = async (): Promise<void> => {
    if (wallet == null) throw new WalletNotConnectedError();
    const tx = await withdrawTokens(connection, wallet, {
      withType: WithdrawType.LiqMining,
      index: 0,
    });
    await sendAndConfirm(tx, { skipPreflight: true });
  };

  return (
    <article className="stake__actions col">
      <div className="stake__plus">
        <span className="title">New staking account</span>
        <div className="add-new">
          <button
            onClick={handleNewStake}
            className="hover:tw-cursor-pointer hover:tw-bg-primary/10 tw-inline-flex tw-justify-center tw-items-center tw-mt-4 tw-text-5xl tw-bg-transparent xs:tw-text-6xl tw-rounded-md xs:tw-rounded-full tw-h-9 tw-w-full xs:tw-h-16 xs:tw-w-16 tw-border xs:tw-border-[3px] tw-border-primary tw-text-primary">
            &#43;
          </button>
        </div>
      </div>
      <div className="separator" />
      <div className="stake__buttons -tw-mt-4 xs:tw-mt-0">
        <button onClick={handleClaimRewards} className="btn btn--md btn--primary">
          Claim Rewards
        </button>
      </div>
    </article>
  );
});
