import { ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { observer } from "mobx-react-lite";
import { StoreContext } from "@pages/_app";
import { OfferAccount, SubOfferAccount } from "@utils/spl/types";
import { OfferHead } from "@components/layout/offerHead";
import { OfferTemplate } from "@components/layout/offerTemplate";
import { usePopperTooltip } from "react-popper-tooltip";
import { OfferActionsHook } from "@hooks/offerActionsHook";
import { eq, gt, gte } from "@utils/bignum";
import { OfferState, SubOfferState } from "@unloc-dev/unloc-loan-solita";
import { DepositTemplate } from "@components/layout/depositTemplate";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SkeletonRectangle } from "@components/skeleton/rectangle";

export type SanitizedOffer = {
  offer: PublicKey;
  metadata: Metadata;
  state: OfferState;
  subOffers: SubOfferAccount[];
};

export const OffersWrap = observer(() => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const store = useContext(StoreContext);
  const { offers, nftData, subOffers, activeCategory, lendingList, activeLoans } = store.MyOffers;
  const [loader, setLoader] = useState(true);
  const { handleDepositClick } = OfferActionsHook();

  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const depositButton = (isMobile?: boolean) => (
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
    const fetchUserLended = async () => {
      if (publicKey) {
        await store.MyOffers.fetchUserLendedOffers(connection, publicKey);
      }
    };
    fetchUserLended();
  }, [connection, publicKey]);

  const accepted = useMemo(() => {
    // Offers in the accepted state
    const acceptedOffers = selectAcceptedOffers(offers, subOffers, nftData);
    if (acceptedOffers.length) {
      return acceptedOffers.map((sanitizedOffer) => (
        <OfferHead key={sanitizedOffer.offer.toBase58()} {...sanitizedOffer} />
      ));
    } else {
      return null;
    }
  }, [offers, subOffers]);

  const lends = useMemo(() => {
    return lendingList.map((subOfferData) => (
      <OfferTemplate key={subOfferData.pubkey.toBase58()} {...subOfferData} isLends={true} />
    ));
  }, [lendingList]);

  const proposed = useMemo(() => {
    // Offers that have at least 1 proposed subOffer
    const proposedOffers = selectProposedOffers(offers, subOffers, nftData);

    if (proposedOffers.length) {
      setLoader(false);
      return proposedOffers.map((sanitizedOffer) => (
        <OfferHead key={sanitizedOffer.offer.toBase58()} {...sanitizedOffer} />
      ));
    } else {
      return <h2 className="no-offers">No offers offered!</h2>;
    }
  }, [offers, subOffers, nftData]);

  const deposited = useMemo(() => {
    const depositedOffers = selectDepositedOffers(offers, subOffers);

    if (depositedOffers.length) {
      setLoader(false);
      return depositedOffers.map((offer) => {
        const selectedNft = nftData.find((nft) => nft.mint.equals(offer.account.nftMint));
        if (!selectedNft) {
          // Fail-safe
          return null;
        }

        return (
          <DepositTemplate
            key={offer.pubkey.toBase58()}
            metadata={selectedNft}
            pubkey={offer.pubkey}
          />
        );
      });
    } else {
      return depositButton();
    }
  }, [offers, subOffers, nftData]);

  const loansGroups = (): ReactNode => {
    return (
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
  };

  return (
    <div className="my-offers-wrap">
      {loader ? (
        <div className="list-row">
          <SkeletonRectangle offerType="my-offers" />
        </div>
      ) : (
        <>
          {activeCategory === "active" && loansGroups()}
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
        subOffer.account.state === SubOfferState.Accepted &&
        gte(subOffer.account.subOfferNumber, offer.account.startSubOfferNum),
    );

    // if (filtered.length !== 1) {
    //   throw Error("Multiple accepted subOffers, check the transaction history");
    // }
    const selectedNft = nftData.find((nft) => nft.mint.equals(offer.account.nftMint));
    if (!selectedNft) return sanitized;

    if (filtered.length > 0) {
      sanitized.push({
        offer: offer.pubkey,
        state: offer.account.state,
        subOffers: filtered,
        metadata: selectedNft,
      });
    }

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
        subOffer.account.state === SubOfferState.Proposed &&
        gte(subOffer.account.subOfferNumber, offer.account.startSubOfferNum),
    );

    const selectedNft = nftData.find((nft) => nft.mint.equals(offer.account.nftMint));
    if (!selectedNft) return sanitized;

    if (filtered.length > 0) {
      sanitized.push({
        offer: offer.pubkey,
        state: offer.account.state,
        subOffers: filtered,
        metadata: selectedNft,
      });
    }

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
const selectDepositedOffers = (offers: OfferAccount[], subOffers: SubOfferAccount[]) => {
  return offers.filter(({ pubkey, account }) => {
    // Short-circuit
    if (account.state !== OfferState.Proposed) {
      return false;
    }
    if (eq(account.startSubOfferNum, account.subOfferCount)) {
      return true;
    }
    return (
      subOffers.filter(
        (subOffer) =>
          subOffer.account.offer.equals(pubkey) &&
          subOffer.account.state === SubOfferState.Proposed &&
          gte(subOffer.account.subOfferNumber, account.startSubOfferNum) &&
          gt(account.subOfferCount, subOffer.account.subOfferNumber),
      ).length === 0
    );
  });
};
