import { useContext, useEffect, useMemo, useState } from "react";

import { observer } from "mobx-react";
import { SanitizedOffer } from "@components/myOffers/offersWrap";
import { OfferActionsHook } from "@hooks/offerActionsHook";
import { StoreContext } from "@pages/_app";
import Image from "next/image";
import { OfferTemplate } from "@components/layout/offerTemplate";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { useCollectionName } from "@hooks/useCollectionName";

export const OfferHead = observer(({ subOffers, metadata, offer, state }: SanitizedOffer) => {
  const [subOfferCount, setSubOfferCount] = useState(0);
  const { createOffersHandler, handleCancelCollateral } = OfferActionsHook();
  const { json, isLoading } = useOffChainMetadata(metadata.data.uri);
  const { collection, isLoading: isLoadingCollection } = useCollectionName(
    metadata.mint.toBase58(),
  );

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
        output = offer.pubkey.toBase58();
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
              onClick={() =>
                createOffersHandler({
                  metadata,
                  offerKey: offer.toBase58(),
                })
              }>
              <span className="sign">+</span>
              <div className="tooltip-container active-offer--tooltip">
                <span>Create a new Loan Offer with this NFT as Collateral</span>
              </div>
            </button>
          )}
          <button
            className="btn--md btn--bordered active-offer--tooltip--parent"
            onClick={() => handleCancelCollateral(metadata.mint, metadata.data.name)}>
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
    if (isLoading) return <div>Loading</div>;
    return subOffers.map((offer) => (
      <OfferTemplate
        key={offer.pubkey.toBase58()}
        withWrap={true}
        pubkey={offer.pubkey}
        account={offer.account}
        activeSubOffer={activeSubOffer}
        nftData={metadata}
      />
    ));
  }, [isLoading, subOffers]);

  return (
    <div className={`offer-wrap ${activeCategory === "active" ? "single-children" : ""}`}>
      {isLoading && <div>Loading</div>}
      {json && (
        <div className="head">
          <div className="image">
            {json.image && <Image src={json.image} width={84} height={84} />}
          </div>
          <div className="info">
            <p>{json.name}</p>
            {!isLoadingCollection && (
              <span>
                Collection: <b>{collection}</b>
              </span>
            )}
          </div>
          {setNFTActions(state)}
        </div>
      )}
      <div className={`body ${activeCategory === "proposed" ? "multi-children" : ""}`}>
        {subOffers && renderOfferTemplate}
      </div>
    </div>
  );
});
