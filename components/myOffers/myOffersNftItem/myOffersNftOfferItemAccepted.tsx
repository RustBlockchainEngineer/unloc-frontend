import React, { useContext } from "react";
import { BN } from "@project-serum/anchor";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { PublicKey } from "@solana/web3.js";
import { currencyMints } from "@constants/currency";
import { StoreContext } from "@pages/_app";
import { usePopperTooltip } from "react-popper-tooltip";
import { toast } from "react-toastify";
import { getDecimalsForLoanAmountAsString } from "@integration/getDecimalForLoanAmount";
import { ShowOnHover } from "@components/layout/showOnHover";
import { ClipboardButton } from "@components/layout/clipboardButton";
import { SolscanExplorerIcon } from "@components/layout/solscanExplorerIcon";

interface MyOffersNftOfferItemAcceptedProps {
  offerAmount: any;
  offerID: PublicKey;
  status: string;
  APR: string;
  duration: BN;
  repaid: string;
  offerMint: PublicKey;
  classNames?: string;
  nftMint: string;
  offers: any[];
}

export const MyOffersNftOfferItemAccepted: React.FC<MyOffersNftOfferItemAcceptedProps> = ({
  offerAmount,
  offerID,
  status,
  APR,
  duration,
  offerMint,
  classNames,
  nftMint,
  offers,
}) => {
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

      toast.success(`Loan Repayed, NFT is back in your wallet`, {
        autoClose: 3000,
        position: "top-center",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (e: any) {
      console.log(e);
      if (e.message === "User rejected the request.") {
        toast.error(`Transaction rejected`, {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(`Something went wrong`, {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } finally {
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(false);
      store.MyOffers.refetchStoreData();
    }
  };

  const getActiveSubOffer = () => {
    let output = "";
    offers.forEach((offer: any) => {
      if (offer.state === 1) {
        output = offer.subOfferKey.toBase58();
      }
    });

    return output;
  };

  const timeLeft = Number(duration.toString()) / 60 / 60 / 24;
  //const timeLeft = -2 //for css testing

  let timeClassNames = "";
  timeClassNames += (status.toString() == "1" && timeLeft > 3 ? "green" : "") + " ";
  timeClassNames +=
    (status.toString() == "1" && timeLeft <= 3 && timeLeft > 0 ? "yellow" : "") + " ";
  timeClassNames += (status.toString() == "1" && timeLeft <= 0 ? "red" : "") + " ";

  const stopOnClickPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`my-offers-nft__offer ${(classNames ? classNames : "") + " "} ${timeClassNames}`}
      onClick={(e) => stopOnClickPropagation(e)}>
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
        <div className={`offer__row--item ${timeClassNames} status`}>
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
        <div className={`offer__row--item ${timeClassNames}`}>
          <h4>{status.toString() == "1" ? "Time left" : "Duration"} </h4>
          <p>{timeLeft} Days</p>
        </div>
        {/* <div className='offer__row--item'>
          <h4>Min repaid value</h4>
          <p>{repaid.toString()}</p>
        </div> */}
      </div>

      {timeLeft > 0 ? (
        <div className="offer__row">
          <button
            ref={setTriggerRef}
            className="btn btn--md btn--primary repay-loan--button"
            onClick={() => handleRepayLoan(getActiveSubOffer())}>
            Repay Loan
          </button>
          {visible && (
            <div ref={setTooltipRef} {...getTooltipProps({ className: "tooltip-container" })}>
              Repay the Loan and get your NFT back
            </div>
          )}
        </div>
      ) : (
        <div className="offer__row">
          <button className="btn btn--md btn--primary loan-expired--button">Loan Expired</button>
        </div>
      )}
    </div>
  );
};
