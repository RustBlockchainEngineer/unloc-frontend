import React, { useContext } from "react";
import Link from "next/link";
import { calculateRepayValue } from "@utils/calculateRepayValue";
import { StoreContext } from "@pages/_app";

interface IProps {
  visible: boolean;
  apr: number;
  name: string;
  totalRepay: any;
  amount: string;
  onLend: (Pubkey: string) => Promise<void>;
  duration: number;
  currency: string;
  subOfferKey: string;
  nftMint: string;
  count?: number;
  collection: string;
  isYours?: boolean;
}

const OffersGridItemHover: React.FC<IProps> = ({
  visible,
  apr,
  name,
  amount,
  totalRepay,
  onLend,
  duration,
  currency,
  subOfferKey,
  nftMint,
  count,
  collection,
  isYours,
}) => {
  return (
    <div className={`onHover-data ${visible ? "" : "hide"}`}>
      <Link passHref href={`/offers/${nftMint}`}>
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
            <span className="content">{apr} %</span>
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
      <button
        className={isYours ? "deactivated" : ""}
        onClick={() => {
          if (!isYours) {
            onLend(subOfferKey);
          }
        }}>
        {isYours ? "Can't Lend" : `Lend ${currency}`}
      </button>
    </div>
  );
};

export default OffersGridItemHover;
