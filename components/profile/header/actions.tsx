import { StoreContext } from "@pages/_app";
import { observer } from "mobx-react-lite";
import { useContext } from "react";

export const StakeActions = observer(() => {
  const { Lightbox, StakingStore } = useContext(StoreContext);
  const handleNewStake = () => {
    console.log("click");
    Lightbox.setVisible(false);
    // Reset the inputs
    StakingStore.resetCreateFormInputs();
    Lightbox.setContent("createStake");
    Lightbox.setVisible(true);
  };
  return (
    <article className="stake__actions col">
      <div className="stake__plus">
        <span>New staking account</span>
        <div className="add-new">
          <button type="button" onClick={handleNewStake}>
            <span className="button--circle">&#43;</span>
          </button>
        </div>
      </div>
      <div className="separator" />
      <div className="stake__buttons">
        <button className="btn btn--md btn--primary">Merge All</button>
        <button className="btn btn--md btn--bordered">Claim Rewards</button>
      </div>
    </article>
  );
});
