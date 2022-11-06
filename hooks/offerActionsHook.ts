import { useCallback, useContext } from "react";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";

import { useSendTransaction } from "@hooks/useSendTransaction";
import { StoreContext } from "@pages/_app";
import { ILightboxOffer, IsubOfferData } from "@stores/Lightbox.store";
import {
  claimLoanCollateral,
  deleteLoanOffer,
  deleteLoanSubOffer,
  repayLoan,
} from "@utils/spl/unloc-loan";
import { errorCase, successCase } from "@utils/toast-error-handler";

interface Sanitized {
  metadata: Metadata;
  offerKey: string;
}

export interface IOfferActionsHook {
  handleClaimCollateral: (offerKey: PublicKey) => Promise<void>;
  refreshSubOffers: (walletKeyProp: PublicKey) => Promise<void>;
  handleCancelCollateral: (nftMint: PublicKey, name: string) => Promise<void>;
  createOffersHandler: ({ offerKey, metadata }: Sanitized) => void;
  handleConfirmOffer: (offer: ILightboxOffer) => void;
  handleCancelOffer: (subOffer: PublicKey) => Promise<void>;
  handleDepositClick: () => void;
  handleEditOffer: (
    subOfferKey: string,
    values: IsubOfferData,
    { offerKey, metadata }: Sanitized,
  ) => void;
  handleRepayLoan: (subOfferKey: string) => Promise<void>;
}

export const OfferActionsHook = (): IOfferActionsHook => {
  const store = useContext(StoreContext);
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();

  const openLightBox = useCallback((): void => {
    store.Lightbox.setContent("circleProcessing");
    store.Lightbox.setCanClose(false);
    store.Lightbox.setVisible(true);
  }, [store.Lightbox]);

  const closeLightBox = useCallback(async (): Promise<void> => {
    await store.MyOffers.refetchStoreData();
    store.Lightbox.setCanClose(true);
    store.Lightbox.setVisible(false);
  }, [store.Lightbox, store.MyOffers]);

  const refreshSubOffers = useCallback(
    async (walletKey: PublicKey): Promise<void> => {
      try {
        if (walletKey) {
          await store.MyOffers.getOffersByWallet(walletKey);
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
        if (wallet == null) throw new Error("Wallet not connected");
        const tx = await deleteLoanOffer(connection, wallet, nftMint, []);
        const { result } = await sendAndConfirm(tx);
        if (result.value.err) throw Error("Failed to cancel offer.");
        successCase(`NFT ${name} returned to the wallet`, name);
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(false);
      } catch (error) {
        console.log({ error });
        errorCase(error);
      } finally {
        await closeLightBox();
      }
    },
    [closeLightBox, openLightBox, store.Lightbox, wallet, sendAndConfirm],
  );

  const createOffersHandler = useCallback(
    ({ offerKey, metadata }: Sanitized): void => {
      store.MyOffers.setActiveNftMint(metadata.mint);
      store.MyOffers.setSanitizedOfferData({
        collateralId: offerKey,
        metadata,
      });
      store.Lightbox.setContent("loanCreate");
      store.Lightbox.setVisible(true);
    },
    [store.Lightbox, store.MyOffers],
  );

  const handleClaimCollateral = useCallback(
    async (subOffer: PublicKey) => {
      openLightBox();

      try {
        if (wallet == null) throw new Error("Wallet not connected");
        const signers: Keypair[] = [];
        const tx = await claimLoanCollateral(connection, wallet, subOffer, signers);
        tx.sign(...signers);
        await sendAndConfirm(tx);
        successCase("NFT Claimed");
      } catch (e) {
        errorCase(e);
      } finally {
        await closeLightBox();
      }
    },
    [closeLightBox, openLightBox, connection, sendAndConfirm, wallet],
  );

  const handleCancelOffer = useCallback(
    async (subOffer: PublicKey) => {
      openLightBox();

      try {
        if (wallet == null) throw new Error("Wallet not connected");

        const tx = await deleteLoanSubOffer(connection, wallet, subOffer);
        await sendAndConfirm(tx);
        successCase("Offer canceled");
      } catch (e) {
        errorCase(e);
      } finally {
        await closeLightBox();
      }
    },
    [closeLightBox, openLightBox, sendAndConfirm, connection, wallet],
  );

  const handleEditOffer = useCallback(
    (subOfferKey: string, values: IsubOfferData, { offerKey, metadata }: Sanitized) => {
      store.Lightbox.setActiveSubOffer(subOfferKey);
      store.Lightbox.setActiveSubOfferData(values);

      store.MyOffers.setSanitizedOfferData({
        collateralId: offerKey,
        metadata,
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
        if (wallet == null) throw new Error("Wallet not connected");
        const subOffer = new PublicKey(subOfferKey);
        const signers: Keypair[] = [];
        const tx = await repayLoan(connection, wallet, subOffer, signers);
        tx?.sign(...signers);
        await sendAndConfirm(tx!);
        successCase("Loan Repayed, NFT is back in your wallet");
      } catch (e) {
        errorCase(e);
      } finally {
        await closeLightBox();
      }
    },
    [closeLightBox, openLightBox, connection, sendAndConfirm, wallet],
  );

  const handleConfirmOffer = useCallback(
    (offer: ILightboxOffer) => {
      try {
        store.Lightbox.setAcceptOfferData(offer);
        store.Lightbox.setContent("acceptOffer");
        store.Lightbox.setCanClose(true);
        store.Lightbox.setVisible(true);
      } catch (e) {
        errorCase(e);
      }
    },
    [store.Lightbox],
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
    handleConfirmOffer,
  };
};
