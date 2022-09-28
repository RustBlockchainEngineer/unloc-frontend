import { ReactElement, useContext } from "react";

import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { OffersGridItem } from "./offersGridItem";

import {
  getDecimalsForLoanAmountAsString,
  getDecimalsForOfferMint,
} from "@integration/getDecimalForLoanAmount";
import { calculateRepayValue } from "@utils/loansMath";
import { ILightboxOffer } from "@stores/Lightbox.store";
import { errorCase } from "@utils/toast-error-handler";
import { useWallet } from "@solana/wallet-adapter-react";
import { SubOfferState } from "@unloc-dev/unloc-loan-solita";
import BN from "bn.js";
import { SkeletonRectangle } from "@components/skeleton/rectangle";

export const OffersGrid = observer(() => {
  const store = useContext(StoreContext);
  const { publicKey: wallet } = useWallet();
  const { pageOfferData, currentPage, maxPage, isLoading } = store.Offers;
  const handleAcceptOffer = async (offer: ILightboxOffer) => {
    try {
      store.Lightbox.setAcceptOfferData(offer);
      store.Lightbox.setContent("acceptOffer");
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(true);
    } catch (e: any) {
      errorCase(e);
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
          key={page.toString()}
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

  const renderPaginator = (active: number, last: number): ReactElement<NodeListOf<Element>>[] => {
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

  if (isLoading) {
    return <SkeletonRectangle offerType="grid" />;
  }

  if (pageOfferData.length === 0) {
    return (
      <div className="offers-grid--empty">
        <h2 className="no-offers">No Offers Created yet</h2>
      </div>
    );
  }

  return (
    <>
      <div className="offers-grid">
        {pageOfferData.map(({ account, pubkey, nftData, collection }, index) => {
          if (account.state === SubOfferState.Proposed) {
            return (
              <OffersGridItem
                key={`offer-${pubkey.toString()}-${index}`}
                subOffer={pubkey}
                offer={account.offer}
                subOfferData={account}
                nftData={nftData}
                amount={getDecimalsForLoanAmountAsString(
                  new BN(account.offerAmount).toNumber(),
                  account.offerMint.toString(),
                  0,
                  2,
                )}
                handleConfirmOffer={handleAcceptOffer}
                isYours={wallet?.equals(account.borrower)}
                collection={collection}
                totalRepay={calculateRepayValue(
                  new BN(account.offerAmount).toNumber() /
                    getDecimalsForOfferMint(account.offerMint.toString()),
                  new BN(account.aprNumerator).toNumber(),
                  new BN(account.loanDuration).toNumber() / (3600 * 24),
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
  );
});
