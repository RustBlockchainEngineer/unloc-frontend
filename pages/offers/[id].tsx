import { useContext, memo, useCallback, useMemo } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { SubOfferState } from "@unloc-dev/unloc-sdk-loan";
import { observer } from "mobx-react-lite";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { OfferTemplate } from "@components/layout/offerTemplate";
import { Header } from "@components/singleOffer/Header/Header";
import { SkeletonOfferId } from "@components/skeleton/offer-id";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { useSingleOffer } from "@hooks/useSingleOffer";
import { StoreContext } from "@pages/_app";
import { getQueryParamAsString } from "@utils/common";

const SingleNftPage: NextPage = observer(() => {
  const router = useRouter();
  const store = useContext(StoreContext);
  const { publicKey: wallet } = useWallet();
  const offerKey = useMemo(() => {
    try {
      return new PublicKey(getQueryParamAsString(router.query.id));
    } catch {
      return null;
    }
  }, [router.query.id]);
  const { nftData, offer, subOffers, isLoading, error } = useSingleOffer(offerKey);

  const hasActive = useMemo(
    () => subOffers.some(({ account }) => account.state === SubOfferState.Accepted),
    [subOffers],
  );
  const isYours = useMemo(
    () => (!(offer == null) && !(wallet == null) ? wallet?.equals(offer.account.borrower) : false),
    [wallet, offer],
  );

  const LoanOffers = useMemo(() => {
    if (isLoading || nftData == null) return null;

    return subOffers.map((subOffer) => {
      const { account, pubkey } = subOffer;
      return (
        account.state === 0 && (
          <OfferTemplate
            key={pubkey.toBase58()}
            pubkey={pubkey}
            account={account}
            nftData={nftData}
            hideImage={true}
          />
        )
      );
    });
  }, [subOffers, nftData, isLoading]);

  const PrivateTerms = memo(function PrivateTerms() {
    const addNewLoan = useCallback(() => {
      const offerAddress = getQueryParamAsString(router.query.id);
      if (nftData != null) {
        store.MyOffers.setActiveNftMint(nftData.mint);
        store.MyOffers.setSanitizedOfferData({
          collateralId: offerAddress,
          metadata: nftData,
        });
      }
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

  const Loans = memo(function Loans() {
    if (hasActive)
      return (
        <h2 className="single-offer-active">Loan Active, can&apos;t claim any offers right now</h2>
      );

    return (
      <div className="offer-grid">
        {LoanOffers}
        {isYours && subOffers.length < 3 && <PrivateTerms />}
      </div>
    );
  });

  return (
    <StoreDataAdapter>
      <LayoutTopMobile />
      <div className="page my-offers">
        <LayoutTop />
        {error && <div>Not found</div>}
        {/* {isLoading && <BlobLoader />} */}
        {isLoading && <SkeletonOfferId />}
        {nftData != null && <Header nftData={nftData} isYours={isYours} />}
        <Loans />
      </div>
    </StoreDataAdapter>
  );
});

// eslint-disable-next-line import/no-default-export
export default SingleNftPage;
