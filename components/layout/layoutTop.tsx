import { useContext, useEffect } from "react";

import { observer } from "mobx-react-lite";

import { AcceptOffer } from "@components/lightboxes/AcceptOffer";
import { CreateCollateral } from "@components/lightboxes/Collateral/createCollateral";
import { LendConfirmation } from "@components/lightboxes/LendConfirm";
import { ConfirmLoan } from "@components/lightboxes/Loan/confirmLoan";
import { CreateLoan } from "@components/lightboxes/Loan/createLoan";
import { CreateStake } from "@components/lightboxes/Staking/create";
import { DepositFlexi } from "@components/lightboxes/Staking/depositFlexi";
import { StakingActions } from "@components/lightboxes/Staking/staking-actions";
import { CircleProcessing } from "@components/lightboxes/circleProcessing";
import { Lightbox } from "@components/lightboxes/lightbox";
import { Processing } from "@components/lightboxes/processing";
import { Vote } from "@components/lightboxes/vote";
import { VoteChoices } from "@components/lightboxes/voteChoices";
import { StoreContext } from "@pages/_app";

import { TopMenu } from "./topMenu";
import { UnlocLogo } from "./unlocLogo";
import { UserToolbox } from "./userToolbox";

export const LayoutTop = observer(() => {
  const store = useContext(StoreContext);
  const { visible, content } = store.Lightbox;

  useEffect(() => {
    visible
      ? document.documentElement.classList.add("overflow-hidden")
      : document.documentElement.classList.remove("overflow-hidden");
  }, [visible]);

  return (
    <>
      <div className="layout-top">
        <UnlocLogo />
        <TopMenu mobileVisible={true} />
        <UserToolbox hideMenu={undefined} isMenuHidden={undefined} />
      </div>
      <button className="rewards-button" type="button">
        <i className={"icon icon--svs icon--reward-light"} />
        <p>
          Unloc Rewards <span>3</span>
        </p>
      </button>
      {visible ? (
        <Lightbox>
          <>
            {content === "loanConfirm" ? <ConfirmLoan /> : <></>}
            {content === "collateral" ? <CreateCollateral /> : <></>}
            {content === "loanCreate" ? <CreateLoan mode="new" /> : <></>}
            {content === "loanUpdate" ? <CreateLoan mode="update" /> : <></>}
            {content === "processing" ? <Processing /> : <></>}
            {content === "lendConfirmation" ? <LendConfirmation /> : <></>}
            {content === "acceptOffer" ? <AcceptOffer /> : <></>}
            {content === "vote" ? <Vote /> : <></>}
            {content === "circleProcessing" ? <CircleProcessing /> : <></>}
            {content === "createStake" && <CreateStake />}
            {content === "mergeStakes" && <StakingActions mode="merge" />}
            {content === "relockStakes" && <StakingActions mode="relock" />}
            {content === "depositFlexi" && <DepositFlexi />}
            {content === "voteChoices" && <VoteChoices />}
          </>
        </Lightbox>
      ) : (
        <></>
      )}
    </>
  );
});
