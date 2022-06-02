import Link from "next/link";
import { ILightboxOffer } from "@stores/Lightbox.store";
import { SyntheticEvent, useCallback, useContext } from "react";
import { StoreContext } from "@pages/_app";

interface IProps {
  visible: boolean;
  APR: number;
  name: string;
  totalRepay: any;
  amount: string;
  handleConfirmOffer: (offer: ILightboxOffer) => void;
  duration: string;
  currency: string;
  subOfferKey: string;
  offerKey: string;
  count?: number;
  collection: string;
  isYours?: boolean;
}

const OffersGridItemHover: React.FC<IProps> = ({
  visible,
  APR,
  name,
  amount,
  totalRepay,
  handleConfirmOffer,
  duration,
  currency,
  subOfferKey,
  offerKey,
  count,
  collection,
  isYours,
}) => {
  const store = useContext(StoreContext);
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
    <div className={`onHover-data ${visible ? "" : "hide"}`}>
      <Link passHref href={`/offers/${offerKey}`}>
        <div className="onHover-link">
          <div className="data-item">
            <span className="item-name">{name}</span>
            {count ? (
              <div className="">
                <span className="label">Offers</span>
                <span className="content">{count}</span>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="data-item">
            <span className="label">APR</span>
            <span className="content">{APR} %</span>
          </div>
          <div className="data-item">
            <span className="label">Amount</span>
            <span className="content">
              {amount} {currency}
            </span>
          </div>
          <div className="data-item">
            <span className="label">Duration</span>
            <span className="content">{duration} Days</span>
          </div>
          <div className="data-item">
            <span className="label">Collection</span>
            <span className="content">{collection}</span>
          </div>
          <div className="data-item">
            <span className="label">Repay amount</span>
            <span className="content">
              {totalRepay} {currency}
            </span>
          </div>
        </div>
      </Link>
      <button className={isYours ? "deactivated" : ""} onClick={handlePrevent}>
        {isYours ? "Can't Lend" : `Lend ${currency}`}
      </button>
    </div>
  );
};

export default OffersGridItemHover;
