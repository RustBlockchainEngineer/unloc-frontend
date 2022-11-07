import { useContext, useEffect, useMemo, useState } from "react";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { OfferState, SubOfferState } from "@unloc-dev/unloc-sdk-loan";
import { observer } from "mobx-react-lite";
import { usePopperTooltip } from "react-popper-tooltip";

import { DepositTemplate } from "@components/layout/depositTemplate";
import { OfferHead } from "@components/layout/offerHead";
import { OfferTemplate } from "@components/layout/offerTemplate";
import { SkeletonRectangle } from "@components/skeleton/rectangle";
import { OfferActionsHook } from "@hooks/offerActionsHook";
import { StoreContext } from "@pages/_app";
import { eq } from "@utils/bignum";
import { OfferAccount, SubOfferAccount } from "@utils/spl/types";

export interface SanitizedOffer {
  offer: PublicKey;
  metadata: Metadata;
  state: OfferState;
  subOffers: SubOfferAccount[];
}

export const OffersWrap = observer(() => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const store = useContext(StoreContext);
  const { offers, nftData, subOffers, activeCategory, lendingList, activeLoans } = store.MyOffers;
  const [loader, setLoader] = useState(true);
  const { handleDepositClick } = OfferActionsHook();

  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const depositButton = (isMobile?: boolean): JSX.Element => (
    <>
      <button
        ref={setTriggerRef}
        className={`btn btn--xl btn--primary deposit-button ${isMobile ? "mobile" : ""}`}
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
    const fetchUserLended = async (): Promise<void> => {
      if (publicKey != null) await store.MyOffers.fetchUserLendedOffers(connection, publicKey);
    };
    void fetchUserLended();
  }, [connection, publicKey]);

  const accepted = useMemo(() => {
    // Offers in the accepted state
    const acceptedOffers = selectAcceptedOffers(offers, subOffers, nftData);
    if (acceptedOffers.length > 0) {
      setLoader(false);
      return acceptedOffers.map((sanitizedOffer) => (
        <OfferHead key={sanitizedOffer.offer.toBase58()} {...sanitizedOffer} />
      ));
    } else return null;
  }, [offers, subOffers]);

  const lends = useMemo(() => {
    return lendingList.map((subOfferData) => (
      <OfferTemplate key={subOfferData.pubkey.toBase58()} {...subOfferData} isLends={true} />
    ));
  }, [lendingList]);

  const proposed = useMemo(() => {
    // Offers that have at least 1 proposed subOffer
    const proposedOffers = selectProposedOffers(offers, subOffers, nftData);

    if (proposedOffers.length > 0) {
      setLoader(false);
      return proposedOffers.map((sanitizedOffer) => (
        <OfferHead key={sanitizedOffer.offer.toBase58()} {...sanitizedOffer} />
      ));
    } else return <h2 className="no-offers">No offers offered!</h2>;
  }, [offers, subOffers, nftData]);

  const deposited = useMemo(() => {
    const depositedOffers = selectDepositedOffers(offers, subOffers);

    if (depositedOffers.length > 0) {
      setLoader(false);
      return depositedOffers.map((offer) => {
        const selectedNft = nftData.find((nft) => nft.mint.equals(offer.account.nftMint));
        if (selectedNft == null)
          // Fail-safe
          return null;

        return (
          <DepositTemplate
            key={offer.pubkey.toBase58()}
            metadata={selectedNft}
            pubkey={offer.pubkey}
          />
        );
      });
    } else return depositButton();
  }, [offers, subOffers, nftData]);

  const loansGroups = (
    <>
      {activeLoans !== "lends" && (
        <>
          <div className="loans-group">Borrows</div>
          <div className="list-row">{accepted}</div>
        </>
      )}
      {activeLoans !== "borrows" && (
        <>
          <div className="loans-group">Lends</div>
          <div className="list-row">{lends}</div>
        </>
      )}
    </>
  );

  return (
    <div className="my-offers-wrap">
      {loader ? (
        <SkeletonRectangle offerType="my-offers" />
      ) : (
        <>
          {activeCategory === "active" && loansGroups}
          {activeCategory === "proposed" && proposed}
          <div className="list-row">{activeCategory === "deposited" && deposited}</div>
        </>
      )}
    </div>
  );
});

/**
 * Filters from all offers and suboffers belonging to a user that are currently in the accepted state.
 * These offers, their suboffer and the related NFT information are mapped to a SanitizedOffer object.
 *
 * @param offers
 * @param subOffers
 * @param nftData
 * @returns
 */
const selectAcceptedOffers = (
  offers: OfferAccount[],
  subOffers: SubOfferAccount[],
  nftData: Metadata[],
): SanitizedOffer[] => {
  return offers.reduce<SanitizedOffer[]>((sanitized, offer) => {
    if (offer.account.state !== OfferState.Accepted) return sanitized;

    const filtered = subOffers.filter(
      (subOffer) =>
        subOffer.account.offer.equals(offer.pubkey) &&
        subOffer.account.state === SubOfferState.Accepted,
    );

    // if (filtered.length !== 1) {
    //   throw Error("Multiple accepted subOffers, check the transaction history");
    // }
    const selectedNft = nftData.find((nft) => nft.mint.equals(offer.account.nftMint));
    if (selectedNft == null) return sanitized;

    if (filtered.length > 0)
      sanitized.push({
        offer: offer.pubkey,
        state: offer.account.state,
        subOffers: filtered,
        metadata: selectedNft,
      });

    return sanitized;
  }, []);
};

/**
 * Filters from all offers and suboffers belonging to a user that are currently in a proposed
 * state and have at least 1 proposed suboffer.
 * These offers, their suboffers and the related NFT information are mapped to a SanitizedOffer object.
 *
 * @param offers
 * @param subOffers
 * @param nftData
 */
const selectProposedOffers = (
  offers: OfferAccount[],
  subOffers: SubOfferAccount[],
  nftData: Metadata[],
): SanitizedOffer[] => {
  return offers.reduce<SanitizedOffer[]>((sanitized, offer) => {
    if (offer.account.state !== OfferState.Proposed) return sanitized;

    const filtered = subOffers.filter(
      (subOffer) =>
        subOffer.account.offer.equals(offer.pubkey) &&
        subOffer.account.state === SubOfferState.Proposed,
    );

    const selectedNft = nftData.find((nft) => nft.mint.equals(offer.account.nftMint));
    if (selectedNft == null) return sanitized;

    if (filtered.length > 0)
      sanitized.push({
        offer: offer.pubkey,
        state: offer.account.state,
        subOffers: filtered,
        metadata: selectedNft,
      });

    return sanitized;
  }, []);
};

/**
 * Filter for offers that are in the "proposed state", but have no active
 * suboffers.
 *
 * @param offers Offers that have the same borrower
 * @param subOffers All subOffers that also have the same borrower
 */
const selectDepositedOffers = (
  offers: OfferAccount[],
  subOffers: SubOfferAccount[],
): OfferAccount[] => {
  return offers.filter(({ pubkey, account }) => {
    // Short-circuit
    if (account.state !== OfferState.Proposed) return false;

    if (eq(account.subOfferCount, account.deletedSubOfferCount)) return true;

    return (
      subOffers.filter(
        (subOffer) =>
          subOffer.account.offer.equals(pubkey) &&
          subOffer.account.state === SubOfferState.Proposed,
      ).length === 0
    );
  });
};
