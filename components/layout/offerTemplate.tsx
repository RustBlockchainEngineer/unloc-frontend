import { useContext } from "react";

import { DepositedOffer } from "@components/myOffers/offersWrap";
import Image from "next/image";
import { observer } from "mobx-react";
import { SubOfferData } from "@stores/Offers.store";
import {
  getDurationColor,
  getDurationFromContractData,
  getTimeLeft,
} from "@utils/timeUtils/timeUtils";
import { NFTMetadata } from "@integration/nftLoan";
import {
  correctTimeLeftDescription,
  lendsTimeLeftHelpers,
  loanStatus,
} from "@components/myOffers/controllers/lendsTimeLeftHelpers";
import { currencyMints } from "@constants/currency";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { ClipboardButton } from "@components/layout/clipboardButton";
import { ShowOnHover } from "@components/layout/showOnHover";
import { getDecimalsForLoanAmountAsString } from "@integration/getDecimalForLoanAmount";
import BN from "bn.js";

import { StoreContext } from "@pages/_app";
import { usePopperTooltip } from "react-popper-tooltip";
import { PublicKey } from "@solana/web3.js";
import { Duration } from "dayjs/plugin/duration";
import { SubOffer } from "../../@types/loans";
import { calculateRepayValue } from "@utils/loansMath";

import { OfferActionsHook } from "@hooks/offerActionsHook";
import { useRouter } from "next/router";
import { getQueryParamAsString } from "@utils/getQueryParamsAsString";

interface OfferTemplateData extends SubOfferData, DepositedOffer, SubOffer {
  isLends?: boolean;
  isDeposited?: boolean;
  withWrap?: boolean;
  publicKey: PublicKey;
  activeSubOffer?: string;
}

export const OfferTemplate = observer(
  ({
    isLends,
    isDeposited,
    withWrap,
    activeSubOffer,
    loanDuration,
    loanStartedTime,
    nftData,
    collection,
    borrower,
    nftMint,
    offerAmount,
    offerMint,
    aprNumerator,
    image,
    name,
    offerKey,
    subOfferKey,
    publicKey,
    state,
    minRepaidNumerator,
  }: OfferTemplateData) => {
    const router = useRouter();
    const { setTriggerRef, visible, getTooltipProps, setTooltipRef } = usePopperTooltip();

    const {
      createOffersHandler,
      handleCancelCollateral,
      handleCancelOffer,
      handleClaimCollateral,
      handleEditOffer,
      handleRepayLoan,
      handleConfirmOffer,
    } = OfferActionsHook();

    const store = useContext(StoreContext);
    const { activeCategory } = store.MyOffers;
    const { theme } = store.Interface;
    const { isYours } = store.SingleOffer;
    const { denominator } = store.GlobalState;

    const imageSrc = nftData ? (nftData as NFTMetadata).arweaveMetadata.image : image;
    const nftName = nftData ? (nftData as NFTMetadata).arweaveMetadata.name : name;

    const timeLeft = getTimeLeft(loanDuration?.toNumber(), loanStartedTime?.toNumber());
    const timeColor = getDurationColor(timeLeft);

    const amount = getDecimalsForLoanAmountAsString(
      offerAmount?.toNumber(),
      offerMint?.toBase58(),
      0,
    );

    const currency = currencyMints[offerMint?.toBase58()];
    const duration = getDurationFromContractData(loanDuration?.toNumber(), "days");

    const canClaim = (timeLeft: Duration) => {
      return timeLeft.asSeconds() <= 0;
    };

    const offerTimeData = (offersState: number, loanDuration: BN, loanStartedTime: BN) => {
      return (
        <>
          <p>{offersState.toString() === "1" ? "Time left" : "Duration"}</p>
          <span>
            {offersState === 1 ? (
              correctTimeLeftDescription(loanDuration, loanStartedTime)
            ) : (
              <>{`${duration} Day${duration > 1 ? "s" : ""}`}</>
            )}
          </span>
        </>
      );
    };

    const isSingleOffer = getQueryParamAsString(router.query.id);

    offerKey = isSingleOffer ? publicKey.toBase58() : offerKey;

    return (
      <div
        className={`offer ${isSingleOffer ? "default" : ""}
        ${withWrap ? (activeCategory === "active" ? "borrows" : "proposed") : ""} ${
          state === 1 ? timeColor : "green"
        } ${isLends ? `lends` : ""} ${isDeposited ? "deposit" : ""} ${
          withWrap ? "with-wrap" : ""
        } ${activeCategory === "proposed" ? "siblings" : ""}
        `}>
        <div className="data-row head">
          <div className="info">
            <div className="image">
              {imageSrc && (
                <Image
                  src={imageSrc}
                  alt="NFT Picture"
                  width={isLends ? 35 : 55}
                  height={isLends ? 35 : 55}
                />
              )}
            </div>
            <div className="details">
              <p>{nftName}</p>

              {isLends && (
                <span>
                  Collection: <b>{collection}</b>
                </span>
              )}
            </div>
          </div>

          {isLends && (
            <div className="timer">
              <span> Time left </span>
              <div className="time-row">{lendsTimeLeftHelpers(timeLeft)}</div>
            </div>
          )}
        </div>
        <div className="data-row offer-status">
          {isLends ? (
            <div className="row-item">
              <p>Borrower ID</p>
              <ShowOnHover label={compressAddress(4, borrower)}>
                <ClipboardButton data={borrower} />
              </ShowOnHover>
            </div>
          ) : (
            <div className="row-item">
              <p>Offer ID</p>
              {console.log(offerKey)}
              <ShowOnHover label={compressAddress(4, offerKey)} classNames="on-hover">
                <ClipboardButton data={offerKey} />
              </ShowOnHover>
            </div>
          )}
          {!isDeposited && (
            <div className="row-item">
              <p>Status</p>
              <div className="on-hover status">
                {loanStatus(timeColor, isLends, state.toString())}
              </div>
            </div>
          )}
          <div className="row-item">
            <p>NFT mint</p>
            <div className="on-hover">
              <ShowOnHover label={compressAddress(4, nftMint)}>
                <ClipboardButton data={borrower} />
              </ShowOnHover>
            </div>
          </div>
          {isDeposited && (
            <div className="row-item">
              <p>Collection</p>
              <div className="on-hover">
                <p>{collection}</p>
              </div>
            </div>
          )}
        </div>
        {!isDeposited && (
          <div className="data-row proposal-details">
            <div>
              <p>Amount</p>
              <span>{`${amount} ${currency}`}</span>
            </div>
            <div>
              <p>APR</p>
              <span>{aprNumerator?.toString()} %</span>
            </div>
            {!isLends && (
              <div className="time">{offerTimeData(state, loanDuration, loanStartedTime)}</div>
            )}
            <div>
              <p>Min repaid value</p>
              <span>10 USDC</span>
            </div>
          </div>
        )}

        {activeCategory === "active" && !isSingleOffer ? (
          <div className="data-row actions reward-info">
            <div className="reward">
              <p>Unclaimed Tokens</p>
              <b>
                2{" "}
                <i
                  className={`icon icon--svs icon--unloc--${theme === "dark" ? "light" : "dark"}`}
                />
              </b>
            </div>

            {isLends ? (
              canClaim(timeLeft) ? (
                <button
                  className="btn btn--md btn--primary"
                  onClick={() => handleClaimCollateral(subOfferKey)}>
                  Claim NFT
                </button>
              ) : (
                <div className="loan__row">
                  <button className="btn btn--md btn--primary disabled">Loan not Repaid yet</button>
                </div>
              )
            ) : canClaim(timeLeft) ? (
              <button className="btn btn--md btn--primary disabled">Loan Expired</button>
            ) : (
              <>
                <button
                  ref={setTriggerRef}
                  className="btn btn--md btn--primary"
                  onClick={() => handleRepayLoan(activeSubOffer as string)}>
                  Repay Loan
                </button>
                {visible && (
                  <div ref={setTooltipRef} {...getTooltipProps({ className: "tooltip-container" })}>
                    Repay the Loan and get your NFT back
                  </div>
                )}
              </>
            )}
            <div className="reward">
              <p>Reward APR</p>
              <b>
                12,7{" "}
                <i
                  className={`icon icon--svs icon--unloc--${theme === "dark" ? "light" : "dark"}`}
                />
              </b>
            </div>
          </div>
        ) : isDeposited ? (
          <div className="data-row actions">
            <button
              className="btn btn--md btn--bordered"
              onClick={() => handleCancelCollateral(nftMint, name)}>
              Cancel Collateral
            </button>
            <button
              ref={setTriggerRef}
              className="btn btn--md btn--primary"
              onClick={() => createOffersHandler({ nftMint, name, image, offerKey })}>
              Create Offer
            </button>
          </div>
        ) : isSingleOffer ? (
          <div className="data-row actions">
            <button
              ref={setTriggerRef}
              className={`btn btn--md btn--primary ${isYours ? "disabled" : ""}`}
              onClick={() =>
                !isYours &&
                handleConfirmOffer({
                  offerPublicKey: publicKey.toBase58(),
                  amount,
                  APR: aprNumerator?.toNumber(),
                  duration: duration.toString(),
                  totalRepay: calculateRepayValue(
                    Number(amount),
                    aprNumerator?.toNumber(),
                    duration,
                    denominator,
                  ),
                  currency,
                })
              }>
              {isYours ? "Can't lend" : `Lent ${currency}`}
            </button>
          </div>
        ) : (
          <div className="data-row actions">
            <button
              className="btn btn--md btn--bordered"
              onClick={() => handleCancelOffer(publicKey.toBase58())}>
              Cancel Offer
            </button>
            <button
              className="btn btn--md btn--primary"
              onClick={() =>
                handleEditOffer(
                  publicKey.toBase58(),
                  {
                    offerAmount: Number(offerAmount),
                    loanDuration: Number(loanDuration),
                    aprNumerator: Number(aprNumerator),
                    minRepaidNumerator: Number(minRepaidNumerator.toString()),
                    offerMint: offerMint.toBase58(),
                  },
                  {
                    name,
                    image,
                    offerKey,
                    nftMint,
                  },
                )
              }>
              Edit Offer
            </button>
          </div>
        )}
      </div>
    );
  },
);
