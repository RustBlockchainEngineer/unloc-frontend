import { useContext, useEffect } from "react";

import { observer } from "mobx-react-lite";

import { StoreContext } from "@pages/_app";
import { UnlocLogo } from "./unlocLogo";
import { TopMenu } from "./topMenu";
import { UserToolbox } from "./userToolbox";
import { Lightbox } from "@components/lightboxes/lightbox";
import { CreateCollateral } from "@components/lightboxes/Collateral/createCollateral";
import { CreateLoan } from "@components/lightboxes/Loan/createLoan";
import { Processing } from "@components/lightboxes/processing";
import { LendConfirmation } from "@components/lightboxes/LendConfirm";
import { AcceptOffer } from "@components/lightboxes/AcceptOffer";
import { ConfirmLoan } from "@components/lightboxes/Loan/confirmLoan";
import { CircleProcessing } from "@components/lightboxes/circleProcessing";
import { CreateStake } from "@components/lightboxes/Staking/create";

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
        <i className={`icon icon--svs icon--reward-light`} />
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
            {content === "circleProcessing" ? <CircleProcessing /> : <></>}
            {content === "createStake" && <CreateStake />}
          </>
        </Lightbox>
      ) : (
        <></>
      )}
    </>
  );
});
