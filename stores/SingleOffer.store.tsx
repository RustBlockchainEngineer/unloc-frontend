import { action, makeAutoObservable, flow } from "mobx";
import axios from "axios";
import * as anchor from "@project-serum/anchor";
import { getOffer, getSubOffersInRange } from "@integration/nftLoan";
import { INftCoreData } from "../@types/nfts/nft";
import { getMetadata } from "@integration/nftIntegration";
import { OfferAccount, Offer, SubOfferAccount } from "../@types/loans";
import { range } from "@utils/range";
import { errorCase } from "@methods/toast-error-handler";

export class SingleOfferStore {
  rootStore;
  offer = {} as OfferAccount;
  nftData = {} as INftCoreData;
  loansData: SubOfferAccount[] = [];
  isYours: boolean = false;
  loansCount = 0;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action.bound fetchOffer = flow(function* (
    this: SingleOfferStore,
    id: string,
    walletAddress?: string,
  ) {
    const pubkey = new anchor.web3.PublicKey(id);
    const offer: Offer = yield getOffer(pubkey);
    this.offer = { publicKey: pubkey, account: offer };
    this.isYours = offer.borrower.toString() === walletAddress;

    const metadata = yield getMetadata(offer.nftMint);
    const collection = yield axios.post("/api/collections/nft", { id: offer.nftMint.toString() });
    if (collection && metadata && metadata.arweaveMetadata) {
      this.nftData = {
        ...metadata.arweaveMetadata,
        collection: collection.data,
        mint: offer.nftMint.toString(),
      };
    }
  });

  @action.bound fetchSubOffers = async (): Promise<void> => {
    if (!this.offer) return;

    // We need to find the suboffer PDAs
    const { startSubOfferNum, subOfferCount } = this.offer.account;
    const subOfferRange = range(startSubOfferNum.toNumber(), subOfferCount.toNumber());

    try {
      const subOffers = await getSubOffersInRange(this.offer.publicKey, subOfferRange);

      this.loansCount = subOffers.filter((s) => s.account.state !== 5).length;
      this.setLoansData(subOffers);
    } catch (e: any) {
      errorCase(e);
    }
  };

  @action.bound setNftData = (data: INftCoreData): void => {
    this.nftData = data;
  };

  @action.bound setLoansData = (data: SubOfferAccount[]): void => {
    this.loansData = data;
  };
}
