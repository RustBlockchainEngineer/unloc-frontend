import { StoreContext } from "@pages/_app";
import { useConnection } from "@solana/wallet-adapter-react";
import { SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useContext } from "react";

export const StakeActions = observer(() => {
  const { connection } = useConnection();
  const { Lightbox, StakingStore } = useContext(StoreContext);

  const handleNewStake = () => {
    Lightbox.setVisible(false);
    // Reset the inputs
    StakingStore.resetCreateFormInputs();
    Lightbox.setContent("createStake");
    Lightbox.setVisible(true);
  };

  const handleClaimRewards = async () => {
    // Temporary
    const info = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
    if (!info) return;
    const unixTime = info.data.readBigInt64LE(8 * 4);
    console.log("Now ", unixTime.toString());
    console.log("Now ", dayjs(Number(unixTime) * 1000).format("DD/MM/YYYY"));
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
        <button className="btn btn--md btn--primary">Merge All</button>
        <button onClick={handleClaimRewards} className="btn btn--md btn--bordered">
          Claim Rewards
        </button>
      </div>
    </article>
  );
});
