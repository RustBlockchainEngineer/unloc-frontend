import { useCallback, useContext, SyntheticEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { calculateRepayValue } from "@utils/loansMath";
import { StoreContext } from "@pages/_app";
import { ILightboxOffer } from "@stores/Lightbox.store";

interface OffersTableItemInterface {
  subOfferKey: string;
  offerKey: string;
  image: string;
  name: string;
  APR: number;
  amount: string;
  duration: string;
  currency: string;
  handleConfirmOffer: (offer: ILightboxOffer) => void;
  count?: number;
  isYours?: boolean;
  collection: string;
  totalRepay: string;
}

export const OffersTableRow = ({
  subOfferKey,
  offerKey,
  image,
  name,
  APR,
  handleConfirmOffer,
  amount,
  duration,
  currency,
  isYours,
  collection,
  totalRepay,
}: OffersTableItemInterface) => {
  const store = useContext(StoreContext);
  const { denominator } = store.GlobalState;

  const handlePrevent = useCallback(
    async (e: SyntheticEvent<HTMLButtonElement, Event>) => {
      if (!isYours) {
        e.stopPropagation();
        e.preventDefault();
        await store.SingleOffer.fetchOffer(offerKey);
        handleConfirmOffer({
          offerPublicKey: subOfferKey,
          amount,
          APR,
          duration,
          totalRepay,
          currency,
        });
      }
    },
    [subOfferKey, handleConfirmOffer],
  );

  return (
    <div className="offers-table-row" key={subOfferKey}>
      <Link href={`/offers/${offerKey}`}>
        <a>
          <div className="row-cell">
            {isYours ? (
              <div className="owner-indicator">
                <i className="icon icon--owner" />
              </div>
            ) : (
              ""
            )}
            {image ? <Image src={image} alt="NFT Picture" width={36} height={36} /> : ""}
            <span className="text-content">{name}</span>
          </div>
          <div className="row-cell">
            <button className={isYours ? "deactivated" : ""} onClick={handlePrevent}>
              {isYours ? "Can't lend" : `Lend ${currency}`}
            </button>
          </div>
          <div className="row-cell">
            <span className="text-content collection">{collection}</span>
          </div>
          <div className="row-cell">
            <span className="text-content">{amount}</span>
          </div>
          <div className="row-cell">
            <span className="text-content">
              <i className={`icon icon--sm icon--currency--${currency}`} />
            </span>
          </div>
          <div className="row-cell">
            <span className="text-content">{APR} %</span>
          </div>
          <div className="row-cell">
            <span className="text-content">{duration} Days</span>
          </div>
          <div className="row-cell">
            <span className="text-content">
              {calculateRepayValue(Number(amount), APR, Number(duration), denominator)}
            </span>
          </div>
        </a>
      </Link>
    </div>
  );
};
