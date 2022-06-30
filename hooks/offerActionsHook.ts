import { useCallback, useContext } from "react";

import { PublicKey } from "@solana/web3.js";

import { errorCase, successCase } from "@methods/toast-error-handler";
import { StoreContext } from "@pages/_app";
import { IsubOfferData } from "@stores/Lightbox.store";

interface ISanitized {
  nftMint: string | PublicKey;
  name: string;
  image: string;
  offerKey: string;
}

export const OfferActionsHook = (): {
  handleClaimCollateral: (offerKey: PublicKey) => Promise<void>;
  refreshSubOffers: (walletKeyProp: PublicKey) => Promise<void>;
  handleCancelCollateral: (nftMint: PublicKey, name: string) => Promise<void>;
  createOffersHandler: ({ nftMint, name, image, offerKey }: ISanitized) => void;
  handleCancelOffer: (subOfferKey: string) => Promise<void>;
  handleDepositClick: () => void;
  handleEditOffer: (
    subOfferKey: string,
    values: IsubOfferData,
    { nftMint, name, image, offerKey }: ISanitized,
  ) => void;
  handleRepayLoan: (subOfferKey: string) => Promise<void>;
} => {
  const store = useContext(StoreContext);

  const openLightBox = useCallback((): void => {
    store.Lightbox.setContent("processing");
    store.Lightbox.setCanClose(false);
    store.Lightbox.setVisible(true);
  }, [store.Lightbox]);

  const closeLightBox = useCallback(async (): Promise<void> => {
    await store.MyOffers.refetchStoreData();
    store.Lightbox.setCanClose(true);
    store.Lightbox.setVisible(false);
  }, [store.Lightbox, store.MyOffers]);

  const refreshSubOffers = useCallback(
    async (walletKeyProp: PublicKey): Promise<void> => {
      try {
        if (walletKeyProp) {
          await store.MyOffers.getOffersByWallet(walletKeyProp);
          await store.MyOffers.getNFTsData();
          await store.MyOffers.getSubOffersByOffers();
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    },
    [store.MyOffers],
  );

  const handleDepositClick = useCallback(() => {
    store.Lightbox.setContent("collateral");
    store.Lightbox.setVisible(true);
  }, [store.Lightbox]);

  const handleCancelCollateral = useCallback(
    async (nftMint: PublicKey, name: string): Promise<void> => {
      openLightBox();

      try {
        await store.MyOffers.handleCancelCollateral(nftMint.toBase58());
        successCase(`NFT ${name} returned to the wallet`, name);
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(false);
      } catch (e) {
        errorCase(e);
      } finally {
        await closeLightBox();
      }
    },
    [closeLightBox, openLightBox, store.Lightbox, store.MyOffers],
  );

  const createOffersHandler = useCallback(
    ({ nftMint, name, image, offerKey }: ISanitized): void => {
      store.MyOffers.setActiveNftMint(nftMint);
      store.MyOffers.setSanitizedOfferData({
        name,
        image,
        collateralId: offerKey,
        nftMint,
      });
      store.Lightbox.setContent("loanCreate");
      store.Lightbox.setVisible(true);
    },
    [store.Lightbox, store.MyOffers],
  );

  const handleClaimCollateral = useCallback(
    async (offerKey: PublicKey) => {
      openLightBox();

      try {
        await store.MyOffers.handleClaimCollateral(offerKey);
        successCase("NFT Claimed");
      } catch (e) {
        errorCase(e);
      } finally {
        await closeLightBox();
      }
    },
    [closeLightBox, openLightBox, store.MyOffers],
  );

  const handleCancelOffer = useCallback(
    async (subOfferKey: string) => {
      openLightBox();

      try {
        await store.MyOffers.handleCancelSubOffer(subOfferKey);
        successCase("Offer canceled");
      } catch (e) {
        errorCase(e);
      } finally {
        await closeLightBox();
      }
    },
    [closeLightBox, openLightBox, store.MyOffers],
  );

  const handleEditOffer = useCallback(
    (
      subOfferKey: string,
      values: IsubOfferData,
      { nftMint, name, image, offerKey }: ISanitized,
    ) => {
      store.Lightbox.setActiveSubOffer(subOfferKey);
      store.Lightbox.setActiveSubOfferData(values);

      store.MyOffers.setSanitizedOfferData({
        name,
        image,
        collateralId: offerKey,
        nftMint,
      });
      store.Lightbox.setContent("loanUpdate");
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(true);
    },
    [store.Lightbox, store.MyOffers],
  );

  const handleRepayLoan = useCallback(
    async (subOfferKey: string) => {
      openLightBox();

      try {
        await store.MyOffers.handleRepayLoan(subOfferKey);
        successCase("Loan Repayed, NFT is back in your wallet");
      } catch (e) {
        errorCase(e);
      } finally {
        await closeLightBox();
      }
    },
    [closeLightBox, openLightBox, store.MyOffers],
  );

  return {
    refreshSubOffers,
    handleDepositClick,
    handleCancelCollateral,
    createOffersHandler,
    handleClaimCollateral,
    handleCancelOffer,
    handleEditOffer,
    handleRepayLoan,
  };
};
