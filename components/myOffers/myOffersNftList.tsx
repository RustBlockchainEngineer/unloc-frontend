import React, { useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { MyOffersNftItem } from "./myOffersNftItem/myOffersNftItem";
import { MyOffersNftDeposited } from "./myOffersNftItem/myOffersNftDeposited";
import { usePopperTooltip } from "react-popper-tooltip";
import { OfferCategory } from "@stores/MyOffers.store";
import { SubOfferAccount } from "../../@types/loans";

type MyOffersNftListProps = {
  type: OfferCategory;
};

export type SanitizedOffer = {
  offerKey: string;
  collection: string;
  nftMint: string;
  description: string;
  external_url: string;
  state: number;
  image: string;
  name: string;
  subOffers: SubOfferAccount[];
};

export const MyOffersNftList = observer(({ type }: MyOffersNftListProps) => {
  const store = useContext(StoreContext);
  const { offers, nftData, subOffers, activeCategory } = store.MyOffers;
  const [sanitizedOffers, setSanitizedOffers] = useState<SanitizedOffer[]>([]);

  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const handleDepositClick = useCallback(() => {
    store.Lightbox.setContent("collateral");
    store.Lightbox.setVisible(true);
  }, []);

  const renderDepositButton = (isMobile?: boolean) => (
    <>
      <button
        ref={setTriggerRef}
        className={`btn btn--xl btn--primary ${isMobile ? "mobile" : ""}`}
        onClick={handleDepositClick}>
        Deposit NFT
      </button>
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: "tooltip-container" })}>
          Create a new Collateral from a NFT
        </div>
      )}
    </>
  );

  useEffect(() => {
    const filtered = offers.filter((offer) => {
      const { state, subOfferCount, startSubOfferNum } = offer.account;

      if (activeCategory === "active") {
        return state === 1;
      } else if (activeCategory === "proposed") {
        return state === 0 && subOfferCount.gt(startSubOfferNum);
      } else {
        // Deposited condition
        return state === 0 && subOfferCount.eq(startSubOfferNum);
      }
    });

    const sanitized: any[] = filtered.map((offer) => {
      let offerSanitized: any = {
        collection: offer.collection,
        offerKey: offer.publicKey.toBase58(),
        nftMint: offer.account.nftMint.toBase58(),
        state: offer.account.state,
        subOffers: [],
      };

      nftData.forEach((nft) => {
        if (nft.mint === offerSanitized.nftMint) {
          const { description, external_url, image, name } = nft.arweaveMetadata;
          offerSanitized = { ...offerSanitized, ...{ description, external_url, image, name } };
        }
      });

      subOffers.forEach((subOffer) => {
        if (subOffer.account.offer.toBase58() === offerSanitized.offerKey) {
          offerSanitized.subOffers.push(subOffer);
        }
      });
      return offerSanitized;
    });
    setSanitizedOffers(sanitized);
  }, [offers, nftData, subOffers]);

  const renderOffers = () => {
    const mappedOffers = sanitizedOffers.map((offer) => {
      if (type === "deposited") {
        return <MyOffersNftDeposited key={offer.offerKey} sanitized={offer} />;
      } else {
        return <MyOffersNftItem key={offer.offerKey} sanitized={offer} />;
      }
    });

    if (mappedOffers.length === 0 && type === "deposited") {
      return <div className="no-offers">{renderDepositButton()}</div>;
    }

    return (
      <>
        {type === "deposited" && renderDepositButton(true)}
        {mappedOffers}
      </>
    );
  };

  return (
    <div className={`${type == "active" ? "my-offers-nft-list" : "nft-deposited"}`}>
      {renderOffers()}
    </div>
  );
});
