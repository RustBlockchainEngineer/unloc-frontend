import { useContext, useMemo, useState, useCallback, useEffect } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { OffersTableRow } from "./offersTableRow";
import { BlobLoader } from "@components/layout/blobLoader";
import { toast } from "react-toastify";
import { ITransformedOffer, transformOffersData } from "@methods/transformOffersData";

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
      console.log("setLabel, switchOrder");
    } else {
      switchOrder(!order);
      sorted = list.reverse();
    }
    updateList(sorted);
    setCompareType(type);
    setInc((i) => i + 1);
  };

  const HandleAcceptOffer = useCallback(
    async (offerPublicKey: string) => {
      try {
        store.Lightbox.setContent("processing");
        store.Lightbox.setCanClose(false);
        store.Lightbox.setVisible(true);
        await store.Offers.handleAcceptOffer(offerPublicKey);
        toast.success(`Loan Accepted`, {
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
      } finally {
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(false);
      }
    },
    [store.Lightbox, store.Offers],
  );

  const MemoizedList = useMemo(() => {
    return list.map((item, index) => {
      return (
        <OffersTableRow
          key={`offer-${item.name}-${index}`}
          subOfferKey={item.subOfferKey}
          nftMint={item.nftMint}
          image={item.image}
          amount={item.amount}
          name={item.name}
          onLend={HandleAcceptOffer}
          apr={item.apr}
          duration={item.duration}
          currency={item.currency}
          count={item.count}
          isYours={item.isYours}
          collection={item.collection ?? ""}
        />
      );
    });
  }, [list, HandleAcceptOffer, inc]);

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
    <div className="offers-table--empty">
      <BlobLoader />
    </div>
  );
});
