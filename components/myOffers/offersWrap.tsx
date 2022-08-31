import { ReactNode, useContext, useEffect, useMemo, useState, Fragment } from "react";

import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { OfferAccount, SubOfferAccount } from "../../@types/loans";
import { OfferHead } from "@components/layout/offerHead";
import { OfferTemplate } from "@components/layout/offerTemplate";
import { BlobLoader } from "@components/layout/blobLoader";
import { PublicKey } from "@solana/web3.js";
import { usePopperTooltip } from "react-popper-tooltip";
import { OfferActionsHook } from "@hooks/offerActionsHook";
import { SubOfferData } from "@stores/Offers.store";

export type SanitizedOffer = {
  offerKey: string;
  collection?: string;
  nftMint: PublicKey;
  description: string;
  external_url: string;
  state: number;
  image: string;
  name: string;
  subOffers: SubOfferAccount[];
};

export type DepositedOffer = Omit<SanitizedOffer, "subOffers">;

export const OffersWrap = observer(() => {
  const store = useContext(StoreContext);
  const {
    offers,
    nftData,
    subOffers,
    activeCategory,
    lendingList,
    activeLoans,
    lendingListCollection,
  } = store.MyOffers;
  const [offersToSanitize, setOffersToSanitize] = useState<SubOfferAccount[]>([]);
  const [filtered, setFiltered] = useState<OfferAccount[]>([]);
  const [sanitizedOffers, setSanitizedOffers] = useState<SanitizedOffer[]>([]);
  const [updatedLends, setUpdatedLends] = useState<SubOfferData[]>([]);
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

  const filterNeededOffersToSanitize = () => {
    const data = offers.filter((offer) => {
      const { state, subOfferCount, startSubOfferNum } = offer.account;
      if (activeCategory === "active") {
        const active = subOffers.filter((offer) => offer.account.state === 1);
        setOffersToSanitize(active);
        return state === 1;
      } else if (activeCategory === "proposed") {
        const proposed = subOffers.filter((offer) => offer.account.state === 0);
        setOffersToSanitize(proposed);
        return state === 0 && subOfferCount.gt(startSubOfferNum);
      } else {
        // Deposited condition
        const deposited = subOffers.filter((offer) => offer.account.state === 0);
        setOffersToSanitize(deposited);
        return state === 0 && subOfferCount.eq(startSubOfferNum);
      }
    });
    setFiltered(data);
  };

  useEffect(() => {
    const fetchUserLended = async () => {
      if (store.Wallet.connected && store.Wallet.wallet) {
        await store.MyOffers.fetchUserLendedOffers();
      }
    };
    fetchUserLended();
  }, [store.Wallet.connected, store.Wallet.wallet]);

  useEffect(() => {
    filterNeededOffersToSanitize();
  }, [offers, nftData, subOffers, activeCategory]);

  const collectDataToRenderOffers = (filtered: OfferAccount[]) => {
    return filtered.map((offer: OfferAccount) => {
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

      offersToSanitize.forEach((subOffer) => {
        if (subOffer.account.offer.toBase58() === offerSanitized.offerKey) {
          offerSanitized.subOffers.push(subOffer);
        }
      });

      return offerSanitized;
    });
  };

  useEffect(() => {
    const sanitized = collectDataToRenderOffers(filtered);
    setSanitizedOffers(sanitized);
  }, [offersToSanitize]);

  useEffect(() => {
    const updatedLends = lendingListCollection.reduce(
      (accum: SubOfferData[], collection, index) => {
        const collectionToLend = collection;
        const offer = {
          ...lendingList[index],
          collectionToLend,
        };
        accum.push(offer);
        return accum;
      },
      [],
    );
    setUpdatedLends(updatedLends);
  }, [lendingListCollection]);

  useEffect(() => {
    if (sanitizedOffers.length > 0 && updatedLends.length > 0) setLoader(false);
  }, [sanitizedOffers, updatedLends]);

  const borrowsOrProposed = useMemo(() => {
    return (
      sanitizedOffers.length > 0 &&
      sanitizedOffers.map((offer) => {
        return <OfferHead key={offer.offerKey.toString()} {...offer} />;
      })
    );
  }, [sanitizedOffers]);

  const lends = useMemo(() => {
    return (
      updatedLends.length > 0 &&
      updatedLends?.map((offer) => (
        <Fragment key={offer.subOfferKey.toString()}>
          {/*// eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/*// @ts-ignore*/}
          <OfferTemplate {...offer} isLends={true} />
        </Fragment>
      ))
    );
  }, [updatedLends]);

  const deposited = useMemo(() => {
    return sanitizedOffers.length > 0
      ? sanitizedOffers.map((offer) => {
          const { subOffers, ...rest } = offer;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return <OfferTemplate key={offer.offerKey.toString()} {...rest} isDeposited={true} />;
        })
      : depositButton();
  }, [sanitizedOffers]);

  const loansGroups = (): ReactNode => {
    return (
      <>
        {activeLoans !== "lends" && (
          <>
            <div className="loans-group">Borrows</div>
            <div className="list-row">{borrowsOrProposed}</div>
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

  return loader ? (
    <BlobLoader />
  ) : (
    <>
      <div className="my-offers-wrap">
        {activeCategory === "active" && loansGroups()}
        {activeCategory === "proposed" && borrowsOrProposed}
        {activeCategory === "deposited" && deposited}
      </div>
    </>
  );
});
