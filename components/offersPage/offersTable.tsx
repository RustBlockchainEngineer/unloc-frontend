import { useContext, useMemo, useState, useCallback, useEffect } from "react";

import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { OffersTableRow } from "./offersTableRow";
// import { BlobLoader } from "@components/layout/blobLoader";
import { ITransformedOffer, transformOffersData } from "@utils/spl/transformOffersData";
import { ILightboxOffer } from "@stores/Lightbox.store";
import { errorCase } from "@utils/toast-error-handler";
import { SkeletonTable } from "@components/skeleton/table";

type CompareType = "string" | "number";

const comparatorFactory = (label: string, type: CompareType) => {
  return (a: any, b: any): number => {
    if (type === "string")
      return a[label]
        .toString()
        .replace(/\s+/g, "")
        .localeCompare(b[label].toString().replace(/\s+/g, ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });
    else if (type === "number") return a[label] - b[label];
    else return 0;
  };
};

export const OffersTable = observer(() => {
  const store = useContext(StoreContext);
  const { currentPage, maxPage, pageOfferData } = store.Offers;
  const { walletKey } = store.Wallet;
  const { denominator } = store.GlobalState;

  const [list, updateList] = useState<ITransformedOffer[]>(
    transformOffersData(pageOfferData, denominator, walletKey),
  );
  const [inc, setInc] = useState(0);
  const [label, setLabel] = useState<string>("");
  const [order, switchOrder] = useState(true);
  const [compareType, setCompareType] = useState<CompareType>();

  useEffect(() => {
    if (walletKey) {
      const newList = transformOffersData(pageOfferData, denominator, walletKey);

      if (label && compareType) {
        const compare = comparatorFactory(label, compareType);
        newList.sort(compare);

        if (!order) {
          newList.reverse();
        }
      }
      updateList(newList);
    }
  }, [pageOfferData, walletKey, denominator]);

  const Sort = (row: EventTarget, type: CompareType = "string") => {
    const element = row as Element;

    const compare = comparatorFactory(element.id, type);

    let sorted;
    if (element.id !== label) {
      setLabel(element.id);
      switchOrder(true);
      sorted = list.sort(compare);
    } else {
      switchOrder(!order);
      sorted = list.reverse();
    }
    updateList(sorted);
    setCompareType(type);
    setInc((i) => i + 1);
  };

  const handleConfirmOffer = useCallback(
    async (offer: ILightboxOffer) => {
      try {
        store.Lightbox.setAcceptOfferData(offer);
        store.Lightbox.setContent("acceptOffer");
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(true);
      } catch (e: any) {
        errorCase(e);
      }
    },
    [store.Lightbox, store.Offers],
  );

  const MemoizedList = useMemo(() => {
    return list.map((item, index) => {
      return (
        <OffersTableRow
          key={`offer-${item.nftData.data.name}-${index}`}
          subOfferKey={item.subOfferKey}
          offerKey={item.offerKey}
          amount={item.amount}
          nftData={item.nftData}
          handleConfirmOffer={handleConfirmOffer}
          APR={item.apr}
          duration={item.duration}
          currency={item.currency}
          isYours={item.isYours}
          collection={item.collection}
          totalRepay={item.repayAmount}
        />
      );
    });
  }, [list, handleConfirmOffer, inc]);

  return list.length ? (
    <>
      <div className="offers-table">
        <div className="offers-table-heading">
          {/*TODO: map it */}
          <div className="row-cell">
            <button id="name" onClick={(e) => Sort(e.target)}>
              Name
              {label === "name" && (
                <i className={`icon icon--sm icon--rnd--triangle--${order ? "down" : "up"}`} />
              )}
            </button>
          </div>
          <div className="row-cell" />
          <div className="row-cell">
            <button id="collection" onClick={(e) => Sort(e.target)}>
              Collection
              {label === "collection" && (
                <i className={`icon icon--sm icon--rnd--triangle--${order ? "down" : "up"}`} />
              )}
            </button>
          </div>
          <div className="row-cell">
            <button id="amount" onClick={(e) => Sort(e.target)}>
              Amount
              {label === "amount" && (
                <i className={`icon icon--sm icon--rnd--triangle--${order ? "down" : "up"}`} />
              )}
            </button>
          </div>
          <div className="row-cell">
            <button id="currency" onClick={(e) => Sort(e.target)}>
              Currency
              {label === "currency" && (
                <i className={`icon icon--sm icon--rnd--triangle--${order ? "down" : "up"}`} />
              )}
            </button>
          </div>
          <div className="row-cell">
            <button id="apr" onClick={(e) => Sort(e.target, "number")}>
              APR
              {label === "apr" && (
                <i className={`icon icon--sm icon--rnd--triangle--${order ? "down" : "up"}`} />
              )}
            </button>
          </div>
          <div className="row-cell">
            <button id="duration" onClick={(e) => Sort(e.target, "number")}>
              Duration
              {label === "duration" && (
                <i className={`icon icon--sm icon--rnd--triangle--${order ? "down" : "up"}`} />
              )}
            </button>
          </div>
          <div className="row-cell">
            <button id="repayAmount" onClick={(e) => Sort(e.target)}>
              Repay amount
              {label === "repayAmount" && (
                <i className={`icon icon--sm icon--rnd--triangle--${order ? "down" : "up"}`} />
              )}
            </button>
          </div>
        </div>

        {MemoizedList}
      </div>
      <div className="offers-pagination">
        <div>
          <button
            disabled={currentPage === 1}
            onClick={() => store.Offers.setCurrentPage(currentPage - 1)}>
            <i className="icon icon--sm icon--paginator--left" />
          </button>
        </div>
        <div className="offers-pagination__pages">
          {[...Array(maxPage)].map((page, index) => (
            <button
              key={`${page}-${index}`}
              className={`page ${index + 1 === currentPage ? "active" : ""}`}
              onClick={() => store.Offers.setCurrentPage(index + 1)}>
              <b>{index + 1}</b>
            </button>
          ))}
        </div>
        <div>
          <button
            disabled={currentPage === maxPage}
            onClick={() => store.Offers.setCurrentPage(currentPage + 1)}>
            <i className="icon icon--sm icon--paginator--right" />
          </button>
        </div>
      </div>
    </>
  ) : (
    <div className="offers-table skeleton">
      <SkeletonTable />
    </div>
  );
});
