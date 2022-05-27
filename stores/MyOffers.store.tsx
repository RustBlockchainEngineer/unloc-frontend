import { action, makeAutoObservable, runInAction, flow } from "mobx";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

import { getWhitelistedNFTsByWallet } from "@integration/nftIntegration";
import {
  getOffersBy,
  getSubOfferList,
  MultipleNFT,
  NFTMetadata,
  createSubOffer,
  repayLoan,
  setOffer,
  cancelSubOffer,
  updateSubOffer,
  cancelOffer,
  getSubOfferMultiple,
  claimCollateral,
} from "@integration/nftLoan";
import { currencies, currencyMints } from "@constants/currency";
import { getDurationForContractData } from "@utils/getDuration";
import { getSubOffersKeysByState } from "@integration/offersListing";
import { Offer, SubOffer } from "../@types/loans";
import { SubOfferData } from "./Offers.store";
import axios from "axios";

export interface OfferAccount {
  publicKey: PublicKey;
  account: Offer;
  collection?: string;
}

export interface SubOfferAccount {
  publicKey: PublicKey;
  account: SubOffer;
}

export class MyOffersStore {
  rootStore;
  offers: OfferAccount[] = [];
  collaterables: NFTMetadata[] = [];
  subOffers: SubOfferAccount[] = [];
  nftData: NFTMetadata[] = [];
  activeNftMint: string = "";
  lendingList: SubOfferData[] = [];
  activeHideable = false;
  depositedHideable = false;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  private filterOffersByState(offers: OfferAccount[], state: number) {
    return offers.filter((offer) => offer.account.state === state);
  }

  @action.bound setOffers(offers: OfferAccount[]): void {
    this.offers = offers;
  }

  @action.bound fetchCollections = flow(function* (this: MyOffersStore, type: string = "offers") {
    try {
      let requests;
      if (type === "lendingList") {
        requests = this.fetchCollectionsForLendingOffers();
      } else {
        requests = this.fetchCollectionForNfts();
      }

      if (requests) {
        const responses = yield axios.all(requests.map((request) => request.request));

        for (const el of requests) {
          if (this[type][el.index] && !this[type][el.index].hasOwnProperty("collection")) {
            this[type][el.index].collection = responses[el.index].data;
          }
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  });

  private fetchCollectionsForLendingOffers() {
    return this.lendingList.map((item, index) => {
      return {
        request: axios.post("/api/collections/nft", { id: item.nftMint.toBase58() }),
        index,
      };
    });
  }

  private fetchCollectionForNfts() {
    return this.offers.map((item, index) => {
      return {
        request: axios.post("/api/collections/nft", { id: item.account.nftMint.toBase58() }),
        index,
      };
    });
  }

  @action.bound async getOffersByWallet(wallet: PublicKey): Promise<void> {
    const offersData = await getOffersBy(wallet, undefined, undefined);
    const proposedOffers = this.filterOffersByState(offersData, 0);
    const activeOffers = this.filterOffersByState(offersData, 1);

    if (offersData) {
      runInAction(() => {
        this.setOffers([...activeOffers, ...proposedOffers]);
      });
    }
  }

  @action.bound setCollaterables(collaterables: NFTMetadata[]): void {
    this.collaterables = collaterables;
  }

  @action.bound async getUserNFTs(wallet: PublicKey): Promise<void> {
    const data = await getWhitelistedNFTsByWallet(wallet);
    if (data) {
      runInAction(() => {
        this.setCollaterables(data);
      });
    }
  }

  @action.bound setNftData(nftData: NFTMetadata[]): void {
    this.nftData = nftData;
  }

  @action.bound setSubOffers(subOffers: SubOfferAccount[]): void {
    this.subOffers = subOffers;
  }

  @action.bound getSubOffersByOffers = flow(function* (this: MyOffersStore) {
    if (this.offers && this.offers.length > 0) {
      const data: SubOfferAccount[] = [];
      for (const offer of this.offers) {
        if (offer && offer.publicKey) {
          const subOfferData = yield getSubOfferList(offer.publicKey);
          data.push(subOfferData);
        }
      }
      this.subOffers = data.flat();
    }
  });

  @action.bound getNFTsData = flow(function* (this: MyOffersStore) {
    if (this.offers && this.offers.length > 0) {
      this.fetchCollections();
      const data: NFTMetadata[] = [];
      const nftMintKeys: PublicKey[] = [];

      for (const offer of this.offers) {
        const nftMint = offer.account.nftMint;

        if (!nftMintKeys.find((mintKey) => mintKey.equals(nftMint))) {
          nftMintKeys.push(nftMint);
        }
      }

      const multipleNft = new MultipleNFT(nftMintKeys);
      yield multipleNft.initialize();
      yield multipleNft.initArweavedata();

      for (const nftMint of nftMintKeys) {
        const nftMeta = multipleNft.getNftMeta(nftMint);

        if (nftMeta) {
          data.push(nftMeta);
        }
      }
      this.nftData = data;
    }
  });

  @action.bound handleCreateSubOffer = async (
    nftMint: string,
    offerAmount: number,
    loanDuration: number,
    aprNumerator: number,
    currency: string,
  ) => {
    const currencyInfo = currencies[currency];

    await createSubOffer(
      new BN(offerAmount * 10 ** currencyInfo.decimals),
      new BN(getDurationForContractData(loanDuration, "days")),
      new BN(1), // minRepaidNumerator
      new BN(aprNumerator),
      new PublicKey(nftMint),
      new PublicKey(currencyInfo.mint),
    );
  };

  @action.bound handleRepayLoan = async (subOfferKey: string) => {
    await repayLoan(new PublicKey(subOfferKey));
  };

  @action.bound setActiveNftMint = (nftMint: string) => {
    this.activeNftMint = nftMint;
  };

  @action.bound refetchStoreData = async () => {
    await this.getOffersByWallet(this.rootStore.Wallet.walletKey);
    await this.getNFTsData();
    await this.getSubOffersByOffers();
  };

  @action.bound createCollateral = async (mint: string) => {
    await setOffer(new PublicKey(mint));
  };

  @action.bound handleCancelCollateral = async (mint: string) => {
    await cancelOffer(new PublicKey(mint));
  };

  @action.bound handleCancelSubOffer = async (subOfferKey: string) => {
    await cancelSubOffer(new PublicKey(subOfferKey));
  };

  @action.bound handleEditSubOffer = async (
    offerAmount: number,
    loanDuration: number,
    aprNumerator: number,
    minRepaidNumerator: number,
    subOffer: string,
  ) => {
    const currencyInfo =
      currencies[currencyMints[this.rootStore.Lightbox.activeSubOfferData.offerMint]];

    await updateSubOffer(
      new BN(offerAmount * 10 ** currencyInfo.decimals),
      new BN(getDurationForContractData(loanDuration, "days")),
      new BN(minRepaidNumerator),
      new BN(aprNumerator),
      new PublicKey(subOffer),
    );
  };

  private initManyNfts = async (nftMintKeys: PublicKey[]) => {
    const multipleNft = new MultipleNFT(nftMintKeys);
    await multipleNft.initialize();
    await multipleNft.initArweavedata();

    return multipleNft;
  };

  @action.bound fetchUserLendedOffers = async () => {
    const activeOffersKeys = await getSubOffersKeysByState([1]);
    if (activeOffersKeys && activeOffersKeys.length) {
      const offersData: SubOfferData[] = await getSubOfferMultiple(activeOffersKeys);

      const lendedLoans = offersData.filter((offer) =>
        offer.lender.equals(this.rootStore.Wallet.walletKey),
      );

      const nftMints = lendedLoans.map((offerData) => {
        return offerData.nftMint;
      });
      const nftsData = await this.initManyNfts(nftMints);

      nftsData.metadatas.forEach((nft, index) => {
        lendedLoans[index].nftData = nft;
      });

      await this.setLendingListData(lendedLoans);

      this.fetchCollections("lendingList");
    }
  };

  @action.bound setLendingListData = async (data: SubOfferData[]): Promise<void> => {
    runInAction(() => {
      this.lendingList = data;
    });
  };

  @action.bound handleClaimCollateral = async (subOffer: PublicKey) => {
    await claimCollateral(subOffer);
  };

  @action.bound setActiveHideable(activeHideable: boolean) {
    runInAction(() => {
      this.activeHideable = activeHideable;
    });
  }

  @action.bound setDepositedHideable(depositedHideable: boolean) {
    runInAction(() => {
      this.depositedHideable = depositedHideable;
    });
  }
}
