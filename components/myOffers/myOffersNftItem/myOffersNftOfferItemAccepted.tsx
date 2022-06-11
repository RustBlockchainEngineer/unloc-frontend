import { useCallback, useContext, useMemo, MouseEvent } from "react";
import { BN } from "@project-serum/anchor";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { PublicKey } from "@solana/web3.js";
import { currencyMints } from "@constants/currency";
import { StoreContext } from "@pages/_app";
import { usePopperTooltip } from "react-popper-tooltip";
import { getDecimalsForLoanAmountAsString } from "@integration/getDecimalForLoanAmount";
import { ShowOnHover } from "@components/layout/showOnHover";
import { ClipboardButton } from "@components/layout/clipboardButton";
import { SolscanExplorerIcon } from "@components/layout/solscanExplorerIcon";
import { SubOfferAccount } from "../../../@types/loans";
import { getTimeLeft, getDurationColor } from "@utils/timeUtils/timeUtils";
import { observer } from "mobx-react";
import { errorCase, successCase } from "@methods/toast-error-handler";

interface MyOffersNftOfferItemAcceptedProps {
  offerAmount: any;
  offerID: PublicKey;
  status: string;
  APR: string;
  startTime: BN;
  duration: BN;
  repaid: string;
  offerMint: PublicKey;
  classNames?: string;
  nftMint: string;
  offers: SubOfferAccount[];
}

export const MyOffersNftOfferItemAccepted = observer(
  ({
    offerAmount,
    offerID,
    status,
    APR,
    startTime,
    duration,
    offerMint,
    classNames,
    nftMint,
    offers,
  }: MyOffersNftOfferItemAcceptedProps) => {
    const store = useContext(StoreContext);
    const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();
    const setStatus = (status: string) => {
      if (status === "1") {
        return <p className={"suboffer-containers__status active"}>Loan Offer Taken</p>;
      }
      return;
    };

    const handleRepayLoan = async (subOfferKey: string) => {
      store.Lightbox.setContent("processing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);

      try {
        await store.MyOffers.handleRepayLoan(subOfferKey);
        successCase("Loan Repayed, NFT is back in your wallet");
      } catch (e: any) {
        errorCase(e);
      } finally {
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(false);
        store.MyOffers.refetchStoreData();
      }
    };

    const activeSubOffer = useMemo(() => {
      let output = "";
      offers.forEach((offer) => {
        if (offer.account.state === 1) {
          output = offer.publicKey.toBase58();
        }
      });

      return output;
    }, [offers]);

    const timeLeft = getTimeLeft(duration.toNumber(), startTime.toNumber());
    const timeClassName = getDurationColor(timeLeft);
    const isExpired = timeLeft.asSeconds() <= 0;
    const uiTimeLeft =
      timeLeft.days() > 0
        ? `${timeLeft.days()} Day(s)`
        : timeLeft.hours() > 0
        ? `${timeLeft.hours()} Hour(s)`
        : timeLeft.minutes() > 0
        ? `${timeLeft.minutes()} Minute(s)`
        : "Expired";

    const stopOnClickPropagation = useCallback((e: MouseEvent<HTMLElement>) => {
      e.stopPropagation();
    }, []);

    return (
      <div
        className={`my-offers-nft__offer ${(classNames || "") + " "} ${timeClassName}`}
        onClick={stopOnClickPropagation}>
        <div className="offer__row">
          <div className="offer__row--item">
            <h4>Collateral ID</h4>
            <ShowOnHover
              label={compressAddress(4, offerID.toString())}
              classNames="suboffer-containers__id">
              <ClipboardButton data={offerID.toString()} />
              <SolscanExplorerIcon type={"token"} address={offerID.toString()} />
            </ShowOnHover>
          </div>
          <div className={`offer__row--item ${timeClassName} status`}>
            <h4>Status</h4>
            {setStatus(status.toString())}
          </div>
          <div className="offer__row--item">
            <h4>NFT Mint</h4>
            <ShowOnHover label={compressAddress(4, nftMint)} classNames="suboffer-containers__mint">
              <ClipboardButton data={nftMint} />
              <SolscanExplorerIcon type={"token"} address={nftMint} />
            </ShowOnHover>
          </div>
        </div>

        <div className="offer__row details">
          <div className="offer__row--item">
            <h4>Amount</h4>
            <p>{`${getDecimalsForLoanAmountAsString(
              offerAmount.toNumber(),
              offerMint.toBase58(),
              0,
            )} ${currencyMints[offerMint.toBase58()]}`}</p>
          </div>

          <div className="offer__row--item">
            <h4>APR</h4>
            <p>{APR.toString()}%</p>
          </div>
          <div className={`offer__row--item ${timeClassName}`}>
            <h4>{status === "1" ? "Time left" : "Duration"} </h4>
            <p>{uiTimeLeft}</p>
          </div>
          {/* <div className='offer__row--item'>
          <h4>Min repaid value</h4>
          <p>{repaid.toString()}</p>
        </div> */}
        </div>

        {isExpired ? (
          <div className="offer__row">
            <button className="btn btn--md btn--primary loan-expired--button">Loan Expired</button>
          </div>
        ) : (
          <div className="offer__row">
            <button
              ref={setTriggerRef}
              className="btn btn--md btn--primary repay-loan--button"
              onClick={() => handleRepayLoan(activeSubOffer)}>
              Repay Loan
            </button>
            {visible && (
              <div ref={setTooltipRef} {...getTooltipProps({ className: "tooltip-container" })}>
                Repay the Loan and get your NFT back
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
