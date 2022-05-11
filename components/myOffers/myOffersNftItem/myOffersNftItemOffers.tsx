import React, { useState } from "react";
import { IsubOfferData } from "@stores/Lightbox.store";

import { MyOffersNftOfferItem } from "./myOffersNftOfferItem";
import { currencyMints } from "@constants/currency";
import { MyOffersNftOfferItemAccepted } from "./myOffersNftOfferItemAccepted";

interface myOffersNftItemOffersProps {
  handleOfferEdit: (subOfferKey: string, values: IsubOfferData) => Promise<void>;
  handleOfferCancel: (subOfferKey: string) => Promise<void>;
  status: number;
  data?: any[];
  nftMint: string;
}

export const MyOffersNftItemOffers: React.FC<myOffersNftItemOffersProps> = ({
  handleOfferEdit,
  handleOfferCancel,
  status,
  data,
  nftMint,
}) => {
  const [contentVisible, setContentVisible] = useState(true);

  const getOffersCount = () => {
    let counter = 0;
    data?.forEach((offer) => {
      if (offer.state === 0) {
        counter++;
      }
    });
    return counter;
  };

  const renderHeadBar = () => {
    if (status === 1) {
      return (
        <div
          className="offers-list-headbar offers-list-headbar--active"
          onClick={() => setContentVisible(!contentVisible)}
        />
      );
    }
    if (data && data.length && getOffersCount() > 0) {
      return (
        <div className="offers-list-headbar" onClick={() => setContentVisible(!contentVisible)} />
      );
    }
    return <></>;
  };

  return data && data.length <= 0 ? (
    <></>
  ) : (
    <div
      className="offers-list"
      onClick={() => {
        if (data && data.length) {
          setContentVisible(!contentVisible);
        }
      }}>
      {renderHeadBar()}
      {data && data.length && contentVisible ? (
        <div className="offers-list-content">
          {data.map((offer) => {
            if (offer.state === 0) {
              return (
                <MyOffersNftOfferItem
                  key={offer.subOfferKey.toBase58()}
                  offerAmount={offer.offerAmount}
                  APR={offer.aprNumerator}
                  status={offer.state}
                  offerID={offer.subOfferKey}
                  duration={offer.loanDuration}
                  repaid={offer.minRepaidNumerator}
                  offerMint={offer.offerMint}
                  handleOfferEdit={handleOfferEdit}
                  handleOfferCancel={handleOfferCancel}
                  nftMint={nftMint}
                  disabled={status === 1}
                />
              );
            } else if (offer.state === 1) {
              return (
                <MyOffersNftOfferItemAccepted
                  key={offer.subOfferKey.toBase58()}
                  offerAmount={offer.offerAmount}
                  APR={offer.aprNumerator}
                  status={offer.state}
                  offerID={offer.subOfferKey}
                  duration={offer.loanDuration}
                  repaid={offer.minRepaidNumerator}
                  offerMint={offer.offerMint}
                  nftMint={nftMint}
                  offers={data}
                />
              );
            }
          })}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
