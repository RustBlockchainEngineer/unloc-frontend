import React, { JSXElementConstructor, ReactElement, useContext } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { OffersGridItem } from "./offersGridItem";
import { currencyMints } from "@constants/currency";
import { BlobLoader } from "@components/layout/blobLoader";
import { toast } from "react-toastify";
import {
  getDecimalsForLoanAmountAsString,
  getDecimalsForOfferMint,
} from "@integration/getDecimalForLoanAmount";
import { calculateRepayValue } from "@utils/calculateRepayValue";
import { ILightboxOffer } from "@stores/Lightbox.store";

export const OffersGrid = observer(() => {
  const store = useContext(StoreContext);
  const { walletKey } = store.Wallet;
  const { pageOfferData, currentPage, maxPage, offersEmpty } = store.Offers;

  const handleAcceptOffer = async (offer: ILightboxOffer) => {
    try {
      store.Lightbox.setAcceptOfferData(offer);
      store.Lightbox.setContent("acceptOffer");
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(true);
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
      } else if ((e as Error).message.includes("503 Service Unavailable")) {
        toast.error("Solana RPC currently unavailable, please try again in a moment", {
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
    }
  };

  const pageBtn = (
    page: number,
    current: number,
    last: number,
  ): ReactElement<NodeListOf<Element>> => {
    const beforeLast = (page: number, last: number): boolean => {
      return page + 1 === last;
    };

    const isNotCurrent = (page: number, current: number): boolean => {
      return page + 1 !== current;
    };

    const isNecessary = (last: number): boolean => {
      return last > 4;
    };

    const isBeggining = (page: number): boolean => {
      return page === 0;
    };

    const getClassName = (page: number, current: number): string => {
      if (page + 1 === current) {
        return "active";
      }

      if (page + 3 === current || page === current + 1) {
        return "mobile-hide";
      }

      return "";
    };

    return (
      <>
        {beforeLast(page, last) && isNotCurrent(page, current) && isNecessary(last) ? (
          <div className="paginator-dots">...</div>
        ) : (
          ""
        )}
        <button
          key={`${page}`}
          className={`page ${getClassName(page, current)}`}
          onClick={() => store.Offers.setCurrentPage(page + 1)}>
          <b>{page + 1}</b>
        </button>
        {isBeggining(page) && isNotCurrent(page, current) && isNecessary(last) ? (
          <div className="paginator-dots">...</div>
        ) : (
          ""
        )}
      </>
    );
  };

  const renderPaginator = (
    active: number,
    last: number,
  ): ReactElement<NodeListOf<Element>, string | JSXElementConstructor<any>>[] => {
    const beforePages = (index: number, active: number): boolean => {
      return index < active && index > active - 4;
    };
    const afterPages = (index: number, active: number): boolean => {
      return index > active && index < active + 2;
    };
    const firstLastCurrent = (index: number, active: number, last: number): boolean => {
      return index == last - 1 || index == active || index == 0;
    };

    return [...Array(last).keys()]
      .filter(
        (page) =>
          beforePages(page, active) ||
          afterPages(page, active) ||
          firstLastCurrent(page, active, last),
      )
      .map((page) => pageBtn(page, active, last));
  };

  return offersEmpty ? (
    <div className="offers-grid--empty">
      <h2 className="no-offers">No Offers Created yet</h2>
    </div>
  ) : pageOfferData.length > 0 ? (
    <>
      <div className="offers-grid">
        {pageOfferData.map((offerData, index) => {
          if ((offerData.state === 0 || offerData.state === 6) && offerData.nftData) {
            return (
              <OffersGridItem
                key={`offer-${offerData.subOfferKey.toString()}-${index}`}
                subOfferKey={offerData.subOfferKey.toString()}
                offerKey={offerData.offer.toString()}
                image={offerData.nftData.arweaveMetadata.image}
                amount={getDecimalsForLoanAmountAsString(
                  offerData.offerAmount.toNumber(),
                  offerData.offerMint.toString(),
                  0,
                  2,
                )}
                name={offerData.nftData.arweaveMetadata.name}
                handleConfirmOffer={handleAcceptOffer}
                APR={offerData.aprNumerator.toNumber()}
                duration={Math.floor(offerData.loanDuration.toNumber() / (3600 * 24)).toString()}
                currency={currencyMints[offerData.offerMint.toBase58()]}
                count={0}
                isYours={walletKey?.equals(offerData.borrower)}
                collection={offerData?.collection ?? ""}
                totalRepay={calculateRepayValue(
                  offerData.offerAmount.toNumber() /
                    getDecimalsForOfferMint(offerData.offerMint.toString()),
                  offerData.aprNumerator.toNumber(),
                  offerData.loanDuration.toNumber() / (3600 * 24),
                  store.GlobalState.denominator,
                )}
              />
            );
          } else return;
        })}
      </div>
      <div className="offers-pagination">
        <div className="mobile-hide">
          <button
            disabled={currentPage === 1}
            onClick={() => store.Offers.setCurrentPage(currentPage - 1)}>
            <i className="icon icon--sm icon--paginator--left" />
          </button>
        </div>
        <div className="offers-pagination__pages">{renderPaginator(currentPage, maxPage)}</div>
        <div className="mobile-hide">
          <button
            disabled={currentPage === maxPage}
            onClick={() => store.Offers.setCurrentPage(currentPage + 1)}>
            <i className="icon icon--sm icon--paginator--right" />
          </button>
        </div>
      </div>
    </>
  ) : (
    <div className="offers-grid--empty">
      <BlobLoader />
    </div>
  );
});
