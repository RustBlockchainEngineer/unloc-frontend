import { useContext, useEffect, useMemo, useState } from "react";

import { observer } from "mobx-react";
import { SanitizedOffer } from "@components/myOffers/offersWrap";
import { OfferActionsHook } from "@hooks/offerActionsHook";
import { StoreContext } from "@pages/_app";
import Image from "next/image";
import { OfferTemplate } from "@components/layout/offerTemplate";

export const OfferHead = observer(
  ({ collection, name, image, subOffers, nftMint, offerKey, state }: SanitizedOffer) => {
    const [subOfferCount, setSubOfferCount] = useState(0);
    const { createOffersHandler, handleCancelCollateral } = OfferActionsHook();

    useEffect(
      () => setSubOfferCount(subOffers.filter((o) => o.account.state !== 5).length),
      [subOffers],
    );

    const store = useContext(StoreContext);
    const { activeCategory } = store.MyOffers;

    const activeSubOffer = useMemo(() => {
      let output = "";
      subOffers.forEach((offer) => {
        if (offer.account.state === 1) {
          output = offer.publicKey.toBase58();
        }
      });

      return output;
    }, [subOffers]);

    const setNFTActions = (status: number) => {
      if (status === 0) {
        return (
          <div className="nft-wallet-actions">
            {subOfferCount < 3 && (
              <button
                className="btn--md btn--primary active-offer--tooltip--parent"
                onClick={() => createOffersHandler({ nftMint, name, image, offerKey })}>
                <span className="sign">+</span>
                <div className="tooltip-container active-offer--tooltip">
                  <span>Create a new Loan Offer with this NFT as Collateral</span>
                </div>
              </button>
            )}
            <button
              className="btn--md btn--bordered active-offer--tooltip--parent"
              onClick={() => handleCancelCollateral(nftMint, name)}>
              <span className="sign">&minus;</span>
              <div className="tooltip-container active-offer--tooltip">
                <span>Return NFT to wallet</span>
              </div>
            </button>
          </div>
        );
      }

      return null;
    };

    const renderOfferTemplate = useMemo(() => {
      return subOffers.map((offer) => {
        return (
          <OfferTemplate
            withWrap={true}
            subOfferKey={offer.publicKey}
            offerKey={offer.publicKey.toBase58()}
            description=""
            external_url=""
            image={image}
            name={name}
            key={offer.publicKey.toBase58()}
            {...offer.account}
            publicKey={offer.publicKey}
            activeSubOffer={activeSubOffer}
          />
        );
      });
    }, [subOffers]);

    return (
      <div className={`offer-wrap ${activeCategory === "active" ? "single-children" : ""}`}>
        <div className="head">
          <div className="image">{image && <Image src={image} width={84} height={84} />}</div>
          <div className="info">
            <p>{name}</p>
            <span>
              Collection: <b>{collection}</b>
            </span>
          </div>
          {setNFTActions(state)}
        </div>
        <div className={`body ${activeCategory === "proposed" ? "multi-children" : ""}`}>
          {subOffers && renderOfferTemplate}
        </div>
      </div>
    );
  },
);