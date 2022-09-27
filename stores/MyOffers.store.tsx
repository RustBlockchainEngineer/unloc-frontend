import { makeAutoObservable, runInAction } from "mobx";
import { Connection, PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

import {
  getOffersBy,
  getSubOfferKeys,
  getSubOfferMultiple,
  getSubOffersInRange,
} from "@integration/nftLoan";
import type {
  OfferAccount,
  PreparedOfferData,
  SanitizedData,
  SubOfferAccount,
} from "@utils/spl/types";

import { range, zipMap } from "@utils/common";
import { Offer, SubOffer, SubOfferState } from "@unloc-dev/unloc-loan-solita";
import { RootStore } from "./Root.store";
import { findMetadataPda } from "@utils/spl/metadata";
import { GmaBuilder } from "@utils/spl/GmaBuilder";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

/**
 * Active: offer that was accepted by someone and needs to be repayed
 * Proposed: offer that has 1 or multiple suboffers waiting to be accepted
 * Deposited: a collateral was deposited, but no offers have been created yet
 */
export type OfferCategory = "active" | "proposed" | "deposited";

type SubOfferData = {
  pubkey: PublicKey;
  account: SubOffer;
  nftData: Metadata;
};

export class MyOffersStore {
  rootStore: RootStore;
  offers: OfferAccount[] = [];
  subOffers: SubOfferAccount[] = [];
  nftData: Metadata[] = [];
  activeNftMint: string = "";
  lendingList: { pubkey: PublicKey; account: SubOffer; nftData: Metadata }[] = [];
  activeCategory: OfferCategory = "active";
  // activeCategory: OfferCategory = "deposited";
  activeLoans: string = "all";
  preparedOfferData: PreparedOfferData = {
    nftMint: "",
    amount: 0,
    duration: 0,
    APR: 0,
    currency: "",
    repayValue: "0.00",
  };
  sanitized = {
    collateralId: "",
    metadata: {} as Metadata,
  };

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setOffers(offers: { pubkey: PublicKey; account: Offer }[]): void {
    this.offers = offers;
  }

  async getOffersByWallet(wallet: PublicKey): Promise<void> {
    const connection = this.rootStore.Wallet.connection;
    if (!connection) {
      console.error("Not connected");
      return;
    }
    const offers = await getOffersBy(connection, wallet, undefined, undefined);
    const proposedOrActive = offers.filter(
      (offer) => offer.account.state === 0 || offer.account.state === 1,
    );

    this.setOffers(proposedOrActive);
  }

  async getSubOffersByOffers(): Promise<void> {
    const connection = this.rootStore.Wallet.connection;
    if (!connection) {
      console.error("Not connected");
      return;
    }

    if (this.offers.length > 0) {
      const data: SubOfferAccount[] = [];
      for (const offer of this.offers) {
        if (offer) {
          const { startSubOfferNum, subOfferCount } = offer.account;
          const subOfferRange = range(
            new BN(startSubOfferNum).toNumber(),
            new BN(subOfferCount).toNumber(),
          );
          const subOfferData = await getSubOffersInRange(connection, offer.pubkey, subOfferRange);
          data.push(...subOfferData);
        }
      }
      runInAction(() => {
        this.subOffers = data;
      });
    }
  }

  async getNFTsData(): Promise<void> {
    const connection = this.rootStore.Wallet.connection;
    if (!connection) {
      console.error("Not connected");
      return;
    }

    if (this.offers.length > 0) {
      const nftPdas = this.offers.map((offer) => offer.account.nftMint).map(findMetadataPda);
      const metadatas = (
        await GmaBuilder.make(connection, nftPdas, { commitment: "confirmed" }).getAndMap(
          (account) => {
            if (!account.exists) return null;
            return Metadata.deserialize(account.data)[0];
          },
        )
      ).filter((item): item is Metadata => item !== null);
      runInAction(() => {
        this.nftData = metadatas;
      });
    }
  }

  setActiveNftMint = (nftMint: string | PublicKey) => {
    this.activeNftMint = typeof nftMint === "string" ? nftMint : nftMint.toBase58();
  };

  refetchStoreData = async () => {
    if (!this.rootStore.Wallet.walletKey) return;

    await this.getOffersByWallet(this.rootStore.Wallet.walletKey);
    await this.getNFTsData();
    await this.getSubOffersByOffers();
  };

  async fetchUserLendedOffers(connection: Connection, wallet: PublicKey) {
    const activeOffersKeys = await getSubOfferKeys(connection, {
      state: SubOfferState.Accepted,
      lender: wallet,
    });
    if (activeOffersKeys && activeOffersKeys.length) {
      const offersData = await getSubOfferMultiple(connection, activeOffersKeys);

      const nftPdas = offersData.map(({ account }) => findMetadataPda(account.nftMint));
      const metadatas = await GmaBuilder.make(connection, nftPdas, {
        commitment: "confirmed",
      }).getAndMap((account) => {
        if (!account.exists) return null;
        return Metadata.deserialize(account.data)[0];
      });

      const zipped = zipMap(offersData, metadatas, (account, metadata) => {
        return { nftData: metadata, ...account };
      }).filter((item): item is SubOfferData => item.nftData !== null);

      runInAction(() => {
        this.lendingList = zipped;
      });
    }
  }

  setActiveCategory(category: OfferCategory): void {
    this.activeCategory = category;
  }

  setPreparedOfferData(data: PreparedOfferData): void {
    this.preparedOfferData = data;
  }

  setSanitizedOfferData(data: SanitizedData): void {
    this.sanitized = data;
  }

  setActiveLoan(loan: string): void {
    this.activeLoans = loan;
  }
}
