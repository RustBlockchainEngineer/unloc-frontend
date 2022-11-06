import { useContext } from "react";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { OfferState, SubOffer } from "@unloc-dev/unloc-sdk-loan";
import BN from "bn.js";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { usePopperTooltip } from "react-popper-tooltip";

import { ClipboardButton } from "@components/layout/clipboardButton";
import { ShowOnHover } from "@components/layout/showOnHover";
import {
  correctTimeLeftDescription,
  lendsTimeLeftHelpers,
  loanStatus,
} from "@components/myOffers/controllers/lendsTimeLeftHelpers";
import { currencyMints } from "@constants/currency";
import { OfferActionsHook } from "@hooks/offerActionsHook";
import { useCollectionName } from "@hooks/useCollectionName";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { getDecimalsForLoanAmountAsString } from "@integration/getDecimalForLoanAmount";
import { StoreContext } from "@pages/_app";
import { getQueryParamAsString } from "@utils/common";
import { calculateRepayValue } from "@utils/loansMath";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import {
  getDurationColor,
  getDurationFromContractData,
  getTimeLeft,
} from "@utils/timeUtils/timeUtils";

interface OfferTemplateData {
  hideImage?: boolean;
  isLends?: boolean;
  isDeposited?: boolean;
  withWrap?: boolean;
  activeSubOffer?: string;
  pubkey: PublicKey;
  account: SubOffer;
  nftData: Metadata;
}

export const OfferTemplate = observer(
  ({
    hideImage,
    isLends,
    isDeposited,
    withWrap,
    activeSubOffer,
    account,
    nftData,
    pubkey,
  }: OfferTemplateData) => {
    const router = useRouter();
    const { setTriggerRef, visible, getTooltipProps, setTooltipRef } = usePopperTooltip();
    const store = useContext(StoreContext);
    const { activeCategory } = store.MyOffers;
    const { theme } = store.Interface;
    const { isYours } = store.SingleOffer;
    const { denominator } = store.GlobalState;
    const { json, isLoading } = useOffChainMetadata(nftData.data.uri);
    const { collection, isLoading: isLoadingCollection } = useCollectionName(
      nftData.mint.toBase58(),
    );

    const {
      handleCancelOffer,
      handleClaimCollateral,
      handleEditOffer,
      handleRepayLoan,
      handleConfirmOffer,
    } = OfferActionsHook();

    const {
      loanDuration,
      loanStartedTime,
      offerAmount,
      offerMint,
      nftMint,
      borrower,
      aprNumerator,
      offer,
      state,
    } = account;

    const timeLeft = getTimeLeft(
      new BN(loanDuration).toNumber(),
      new BN(loanStartedTime).toNumber(),
    );
    const timeColor = getDurationColor(timeLeft);

    const amount = getDecimalsForLoanAmountAsString(
      new BN(offerAmount).toNumber(),
      offerMint?.toBase58(),
      0,
    );

    const currency = currencyMints[offerMint?.toBase58()];
    const duration = getDurationFromContractData(new BN(loanDuration).toNumber(), "days");

    const canClaim = (timeLeft: Duration): boolean => {
      return timeLeft.asSeconds() <= 0;
    };

    const offerTimeData = (
      offersState: number,
      loanDuration: BN,
      loanStartedTime: BN,
    ): JSX.Element => {
      return (
        <>
          <p>{offersState.toString() === "1" ? "Time left" : "Duration"}</p>
          <span>
            {offersState === OfferState.Accepted ? (
              correctTimeLeftDescription(loanDuration, loanStartedTime)
            ) : (
              <>{`${duration} Day${duration > 1 ? "s" : ""}`}</>
            )}
          </span>
        </>
      );
    };

    const isSingleOffer = getQueryParamAsString(router.query.id);

    const offerKey = isSingleOffer ? pubkey.toBase58() : offer.toBase58();

    return (
      <div
        className={`offer ${isSingleOffer ? "default" : ""}
        ${withWrap ? (activeCategory === "active" ? "borrows" : "proposed") : ""} ${
          state === 1 ? timeColor : "green"
        } ${isLends ? "lends" : ""} ${withWrap ? "with-wrap" : ""} ${
          activeCategory === "proposed" ? "siblings" : ""
        }
        `}>
        {!hideImage && (
          <div className="data-row head">
            <div className="info">
              <div className="image">
                {!isLoading && json && (
                  <Image
                    src={json.image}
                    alt="NFT Picture"
                    width={isLends ? 35 : 55}
                    height={isLends ? 35 : 55}
                  />
                )}
              </div>
              <div className="details">
                {!isLoading && json && <p>{json.name}</p>}
                {isLends && !isLoadingCollection && (
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
        )}
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
                <ClipboardButton data={nftMint} />
              </ShowOnHover>
            </div>
          </div>
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
              <div className="time">
                {offerTimeData(state, new BN(loanDuration), new BN(loanStartedTime))}
              </div>
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
                  onClick={async () => await handleClaimCollateral(pubkey)}>
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
                  onClick={async () => await handleRepayLoan(activeSubOffer as string)}>
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
        ) : isSingleOffer ? (
          <div className="data-row actions">
            <button
              ref={setTriggerRef}
              className={`btn btn--md btn--primary ${isYours ? "disabled" : ""}`}
              onClick={() =>
                !isYours &&
                handleConfirmOffer({
                  offerPublicKey: pubkey.toBase58(),
                  amount,
                  APR: aprNumerator.toString(),
                  duration: duration.toString(),
                  totalRepay: calculateRepayValue(
                    Number(amount),
                    new BN(aprNumerator).toNumber(),
                    duration,
                    denominator,
                  ),
                  currency,
                })
              }>
              {isYours ? "Can't lend" : `Lend ${currency}`}
            </button>
          </div>
        ) : (
          <div className="data-row actions">
            <button
              className="btn btn--md btn--bordered"
              onClick={async () => await handleCancelOffer(pubkey)}>
              Cancel Offer
            </button>
            <button
              className="btn btn--md btn--primary"
              onClick={() =>
                handleEditOffer(
                  pubkey.toBase58(),
                  {
                    offerAmount: Number(offerAmount),
                    loanDuration: Number(loanDuration),
                    aprNumerator: Number(aprNumerator),
                    offerMint: offerMint.toBase58(),
                  },
                  {
                    offerKey,
                    metadata: nftData,
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
