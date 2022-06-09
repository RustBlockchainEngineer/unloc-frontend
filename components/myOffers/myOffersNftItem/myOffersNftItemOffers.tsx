import React, { useState } from "react";
import { IsubOfferData } from "@stores/Lightbox.store";

import { MyOffersNftOfferItem } from "./myOffersNftOfferItem";
import { MyOffersNftOfferItemAccepted } from "./myOffersNftOfferItemAccepted";
import { SubOfferAccount } from "../../../@types/loans";

interface IMyOffersNftItemOffersProps {
  handleOfferEdit: (subOfferKey: string, values: IsubOfferData) => Promise<void>;
  handleOfferCancel: (subOfferKey: string) => Promise<void>;
  handleAddOffer: () => void;
  handleCancelCollateral: () => Promise<void>;
  status: number;
  data?: SubOfferAccount[];
  nftMint: string;
}

export const MyOffersNftItemOffers = ({
  handleOfferEdit,
  handleOfferCancel,
  handleAddOffer,
  handleCancelCollateral,
  status,
  data,
  nftMint,
}: IMyOffersNftItemOffersProps) => {
  const [contentVisible, setContentVisible] = useState(true);

  const getOffersCount = () => {
    let counter = 0;
    data?.forEach((offer) => {
      if (offer.account.state === 0) {
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

  const renderNFTActions = () => {
    if (status === 0) {
      return (
        <div className="nft-info-buttons__mobile">
          <button
            className="btn btn--md btn--primary active-offer--tooltip--parent"
            onClick={handleAddOffer}>
            +
          </button>
          <button
            className="btn btn--md btn--primary active-offer--tooltip--parent"
            onClick={handleCancelCollateral}>
            &minus;
          </button>
        </div>
      );
    } else return null;
  };

  return data && data.length === 0 ? (
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
      {renderNFTActions()}
      {data && data.length && contentVisible ? (
        <div className="offers-list-content">
          {data.map((offer) => {
            const {
              offerAmount,
              aprNumerator,
              state,
              loanStartedTime,
              loanDuration,
              minRepaidNumerator,
              offerMint,
            } = offer.account;
            if (state === 0) {
              return (
                <MyOffersNftOfferItem
                  key={offer.publicKey.toBase58()}
                  offerAmount={offerAmount}
                  APR={aprNumerator.toString()}
                  status={state.toString()}
                  offerID={offer.publicKey}
                  duration={loanDuration}
                  repaid={minRepaidNumerator.toString()}
                  offerMint={offerMint}
                  handleOfferEdit={handleOfferEdit}
                  handleOfferCancel={handleOfferCancel}
                  nftMint={nftMint}
                  disabled={status === 1}
                />
              );
            } else if (offer.account.state === 1) {
              return (
                <MyOffersNftOfferItemAccepted
                  key={offer.publicKey.toBase58()}
                  offerAmount={offerAmount}
                  APR={aprNumerator.toString()}
                  status={state.toString()}
                  offerID={offer.publicKey}
                  startTime={loanStartedTime}
                  duration={loanDuration}
                  repaid={minRepaidNumerator.toString()}
                  offerMint={offerMint}
                  nftMint={nftMint}
                  offers={data}
                />
              );
            } else {
              return null;
            }
          })}
        </div>
      ) : null}
    </div>
  );
};
