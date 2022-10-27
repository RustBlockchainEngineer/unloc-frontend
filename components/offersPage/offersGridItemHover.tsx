import { SyntheticEvent, useCallback, useContext, FC } from "react";

import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { observer } from "mobx-react-lite";
import Link from "next/link";

import { StoreContext } from "@pages/_app";
import { ILightboxOffer } from "@stores/Lightbox.store";

interface IProps {
  visible: boolean;
  APR: string;
  name: string;
  totalRepay: any;
  amount: string;
  handleConfirmOffer: (offer: ILightboxOffer) => void;
  duration: string;
  currency: string;
  subOfferAddress: string;
  offer: PublicKey;
  collection: string;
  isYours?: boolean;
}

export const OffersGridItemHover: FC<IProps> = observer(
  ({
    visible,
    APR,
    name,
    amount,
    totalRepay,
    handleConfirmOffer,
    duration,
    currency,
    subOfferAddress,
    offer,
    collection,
    isYours,
  }) => {
    const store = useContext(StoreContext);
    const { connection } = useConnection();
    const handlePrevent = useCallback(
      async (e: SyntheticEvent<HTMLButtonElement, Event>) => {
        if (!isYours) {
          e.stopPropagation();
          e.preventDefault();
          await store.SingleOffer.fetchOffer(connection, offer);
          handleConfirmOffer({
            offerPublicKey: subOfferAddress,
            amount,
            APR,
            duration,
            totalRepay,
            currency,
          });
        }
      },
      [subOfferAddress, handleConfirmOffer, connection],
    );

    return (
      <div className={`onHover-data ${visible ? "" : "hide"}`}>
        <Link passHref href={`/offers/${offer.toBase58()}`}>
          <div className="onHover-link">
            <div className="data-item">
              <span className="item-name">{name}</span>
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
  },
);
