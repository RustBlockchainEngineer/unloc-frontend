import { useContext, useEffect, useState, memo, useCallback, useMemo } from "react";

import { observer } from "mobx-react";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { BlobLoader } from "@components/layout/blobLoader";
import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { Header } from "@components/singleOffer/Header/Header";
import { Offer } from "@components/singleOffer/Offer/Offer";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { currencyMints } from "@constants/currency";
import { errorCase } from "@methods/toast-error-handler";
import { StoreContext } from "@pages/_app";
import { ILightboxOffer } from "@stores/Lightbox.store";
import { getQueryParamAsString } from "@utils/getQueryParamsAsString";

const SingleNftPage: NextPage = observer(() => {
  const router = useRouter();
  const store = useContext(StoreContext);

  const { connected, walletKey } = store.Wallet;
  const { nftData, loansData, isYours, loansCount } = store.SingleOffer;

  const [hasActive, setHasActive] = useState(false);

  const handleData = useCallback(async (): Promise<void> => {
    try {
      if (connected && walletKey && router.query.id) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await store.SingleOffer.fetchOffer(
          getQueryParamAsString(router.query.id),
          walletKey?.toString(),
        );
        await store.SingleOffer.fetchSubOffers();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }, [connected, walletKey, router.query.id, store.SingleOffer]);

  const handleConfirmOffer = useCallback(
    (offer: ILightboxOffer) => {
      try {
        store.Lightbox.setAcceptOfferData(offer);
        store.Lightbox.setContent("acceptOffer");
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(true);
      } catch (e: any) {
        errorCase(e);
      }
    },
    [store.Lightbox],
  );

  useEffect(() => {
    void handleData();
  }, [router.query.id, connected, handleData]);

  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      store.SingleOffer.setNftData({
        collection: "",
        mint: "",
        image: "",
        name: "",
        //TODO: temporary commented but should match strictCamelCase
        // eslint-disable-next-line @typescript-eslint/naming-convention
        external_url: "",
      });
      store.SingleOffer.setLoansData([]);
    });
  }, [router.events, store.SingleOffer, loansCount]);

  useEffect(() => {
    if (loansData && loansData.length)
      loansData.forEach((loan) => {
        if (loan.status === 1) setHasActive(true);
      });
  }, [loansData]);

  const LoanOffers = useMemo(() => {
    return loansData.map((offer) => {
      if (offer.status === 0)
        return (
          <Offer
            key={offer.id}
            offerID={offer.id}
            offerMint={offer.offerMint}
            offerPublicKey={offer.publicKey.toBase58()}
            status={offer.status.toString()}
            amount={offer.amount}
            token={currencyMints[offer.offerMint.toString()]}
            duration={offer.duration.toString()}
            // durationRemaning='20' // TODO: include date of offer creation in Program data
            APR={offer.apr}
            totalRepay={offer.totalRepay}
            btnMessage={`Lend ${offer.currency}`}
            handleConfirmOffer={handleConfirmOffer}
            isYours={isYours}
          />
        );
      else return null;
    });
  }, [handleConfirmOffer, isYours, loansData]);

  const PrivateTerms = memo(() => {
    const addNewLoan = useCallback(() => {
      store.MyOffers.setActiveNftMint(nftData.mint);
      store.Lightbox.setContent("loanCreate");
      store.Lightbox.setVisible(true);
    }, []);
    return (
      <div className="offer-root--add-new">
        <button onClick={addNewLoan}>
          <span className="offer-root--add-new__plus active-offer--tooltip--parent">
            &#43;
            <span className="tooltip-container active-offer--tooltip">
              Create a new loan offer with your terms!
            </span>
          </span>
        </button>
      </div>
    );
  });

  const Loans = memo(() => {
    if (hasActive)
      return (
        <h2 className="single-offer-active">Loan Active, can&apos;t claim any offers right now</h2>
      );
    else if (loansData && loansData.length)
      return (
        <div className="offer-grid">
          {LoanOffers}
          {isYours && loansCount < 3 && <PrivateTerms />}
        </div>
      );
    else
      return (
        <div className="offer-grid-empty">
          <BlobLoader />
        </div>
      );
  });

  return (
    <StoreDataAdapter>
      <LayoutTopMobile />
      <div className="page my-offers">
        <LayoutTop />
        {nftData && (
          <Header
            collectionName={nftData.collection}
            nftAddress={nftData.mint}
            nftImage={nftData.image}
            nftName={nftData.name}
            website={nftData.external_url}
            isYours={isYours}
          />
        )}
        <Loans />
      </div>
    </StoreDataAdapter>
  );
});

export default SingleNftPage;
