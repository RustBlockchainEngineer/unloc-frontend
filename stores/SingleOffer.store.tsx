import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, PublicKey } from "@solana/web3.js";
import { Offer } from "@unloc-dev/unloc-sdk-loan";
import { makeAutoObservable, runInAction } from "mobx";

import { findMetadataPda } from "@utils/spl/metadata";
import { OfferAccount, SubOfferAccount } from "@utils/spl/types";

export class SingleOfferStore {
  rootStore;
  offer: OfferAccount | null = null;
  nftData: Metadata | null = null;
  loansData: SubOfferAccount[] = [];
  isYours: boolean = false;
  loansCount = 0;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  async fetchOffer(connection: Connection, offer: PublicKey, wallet?: PublicKey): Promise<void> {
    const offerInfo = await Offer.fromAccountAddress(connection, offer);
    const metadataPda = findMetadataPda(offerInfo.nftMint);
    const metadata = await Metadata.fromAccountAddress(connection, metadataPda);

    runInAction(() => {
      this.offer = { pubkey: offer, account: offerInfo };
      this.isYours = wallet?.equals(offerInfo.borrower) ?? false;
      this.nftData = metadata;
    });
  }

  setNftData = (data: Metadata): void => {
    this.nftData = data;
  };

  setLoansData = (data: SubOfferAccount[]): void => {
    this.loansData = data;
  };
}
