import { useContext, useEffect, useState, memo, useCallback, useMemo } from "react";

import { PublicKey } from "@solana/web3.js";
import { observer } from "mobx-react";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { BlobLoader } from "@components/layout/blobLoader";
import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { OfferTemplate } from "@components/layout/offerTemplate";
import { Header } from "@components/singleOffer/Header/Header";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { StoreContext } from "@pages/_app";
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
        external_url: "",
      });
      store.SingleOffer.setLoansData([]);
    });
  }, [router.events, store.SingleOffer, loansCount]);

  useEffect(() => {
    if (loansData && loansData.length)
      loansData.forEach((offer) => {
        const { account } = offer;
        if (account.state === 1) setHasActive(true);
      });
  }, [loansData]);

  const LoanOffers = useMemo(() => {
    return (
      loansData.length > 0 &&
      loansData.map((offer) => {
        const { account, publicKey } = offer;
        return (
          account.state === 0 && (
            <OfferTemplate
              subOfferKey={new PublicKey("")}
              offerKey=""
              description=""
              external_url=""
              image=""
              name=""
              {...account}
              publicKey={publicKey}
            />
          )
        );
      })
    );
  }, [loansData]);

  const PrivateTerms = memo(() => {
    const addNewLoan = useCallback(() => {
      const offerAddress = getQueryParamAsString(router.query.id);
      store.MyOffers.setActiveNftMint(nftData.mint);
      store.MyOffers.setSanitizedOfferData({
        name: nftData.name,
        image: nftData.image,
        collateralId: offerAddress,
        nftMint: nftData.mint,
      });
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
