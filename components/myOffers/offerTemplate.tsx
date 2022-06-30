import { useContext, useEffect, useMemo, useState } from "react";

import { DepositedOffer, SanitizedOffer } from "@components/myOffers/offersWrap";
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

import { OfferActionsHook } from "@hooks/offerActionsHook";

export const OfferWrap = observer(
  ({ collection, name, image, subOffers, nftMint, offerKey, state }: SanitizedOffer) => {
    const [subOfferCount, setSubOfferCount] = useState(0);
    const { createOffersHandler, handleCancelCollateral } = OfferActionsHook();

    useEffect(
      () => setSubOfferCount(subOffers.filter((o) => o.account.state !== 5).length),
      [subOffers],
    );

    const store = useContext(StoreContext);
    const { activeCategory } = store.MyOffers;

    const activeSubOffer = useMemo(() => {
      let output = "";
      subOffers.forEach((offer) => {
        if (offer.account.state === 1) {
          output = offer.publicKey.toBase58();
        }
      });

      return output;
    }, [subOffers]);

    const setNFTActions = (status: number) => {
      if (status === 0) {
        return (
          <div className="nft-wallet-actions">
            {subOfferCount < 3 && (
              <button
                className="btn--md btn--primary active-offer--tooltip--parent"
                onClick={() => createOffersHandler({ nftMint, name, image, offerKey })}>
                <span className="sign">+</span>
                <div className="tooltip-container active-offer--tooltip">
                  <span>Create a new Loan Offer with this NFT as Collateral</span>
                </div>
              </button>
            )}
            <button
              className="btn--md btn--bordered active-offer--tooltip--parent"
              onClick={() => handleCancelCollateral(nftMint, name)}>
              <span className="sign">&minus;</span>
              <div className="tooltip-container active-offer--tooltip">
                <span>Return NFT to wallet</span>
              </div>
            </button>
          </div>
        );
      }

      return null;
    };

    const renderOfferTemplate = useMemo(() => {
      return subOffers.map((offer) => {
        return (
          <OfferTemplate
            withWrap={true}
            subOfferKey={offer.publicKey}
            offerKey={offer.publicKey.toBase58()}
            description=""
            external_url=""
            image={image}
            name={name}
            key={offer.publicKey.toBase58()}
            {...offer.account}
            publicKey={offer.publicKey}
            activeSubOffer={activeSubOffer}
          />
        );
      });
    }, [subOffers]);

    return (
      <div className={`offer-wrap ${activeCategory === "active" ? "single-children" : ""}`}>
        <div className="head">
          <div className="image">{image && <Image src={image} width={84} height={84} />}</div>
          <div className="info">
            <p>{name}</p>
            <span>
              Collection: <b>{collection}</b>
            </span>
          </div>
          {setNFTActions(state)}
        </div>
        <div className={`body ${activeCategory === "proposed" ? "multi-children" : ""}`}>
          {subOffers && renderOfferTemplate}
        </div>
      </div>
    );
  },
);

interface OfferTemplateData extends SubOfferData, DepositedOffer, SubOffer {
  isLends?: boolean;
  isDeposited?: boolean;
  withWrap?: boolean;
  publicKey: PublicKey;
  activeSubOffer: string;
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
    const { setTriggerRef, visible, getTooltipProps, setTooltipRef } = usePopperTooltip();

    const {
      createOffersHandler,
      handleCancelCollateral,
      handleCancelOffer,
      handleClaimCollateral,
      handleEditOffer,
      handleRepayLoan,
    } = OfferActionsHook();

    const store = useContext(StoreContext);
    const { activeCategory } = store.MyOffers;
    const { theme } = store.Interface;

    const imageSrc = nftData ? (nftData as NFTMetadata).arweaveMetadata.image : image;
    const nftName = nftData ? (nftData as NFTMetadata).arweaveMetadata.name : name;

    const duration = getTimeLeft(loanDuration?.toNumber(), loanStartedTime?.toNumber());
    const timeColor = getDurationColor(duration);

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
              <>
                {`${getDurationFromContractData(loanDuration.toNumber(), "days")} Day${
                  getDurationFromContractData(loanDuration.toNumber(), "days") > 1 ? "s" : ""
                }`}
              </>
            )}
          </span>
        </>
      );
    };

    return (
      <div
        className={`offer  
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
              <div className="time-row">{lendsTimeLeftHelpers(duration)}</div>
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
              <span>{`${getDecimalsForLoanAmountAsString(
                offerAmount?.toNumber(),
                offerMint?.toBase58(),
                0,
              )} ${currencyMints[offerMint?.toBase58()]}`}</span>
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
        {activeCategory === "active" ? (
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
              canClaim(duration) ? (
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
            ) : canClaim(duration) ? (
              <button className="btn btn--md btn--primary disabled">Loan Expired</button>
            ) : (
              <>
                <button
                  ref={setTriggerRef}
                  className="btn btn--md btn--primary"
                  onClick={() => handleRepayLoan(activeSubOffer)}>
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
