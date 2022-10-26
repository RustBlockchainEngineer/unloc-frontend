import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { SubOffer } from "@unloc-dev/unloc-loan-solita";
import axios from "axios";
import BN from "bn.js";
import { action, makeAutoObservable, runInAction } from "mobx";

import { currencyMints } from "@constants/currency";
import { getDecimalsForOfferMint } from "@integration/getDecimalForLoanAmount";
import { getFrontPageSubOffers } from "@integration/nftLoan";
import { zipMap } from "@utils/common";
import { GmaBuilder } from "@utils/spl/GmaBuilder";
import { findMetadataPda } from "@utils/spl/metadata";
import { SubOfferAccount } from "@utils/spl/types";

import { RootStore } from "./Root.store";

export interface SubOfferData {
  pubkey: PublicKey;
  account: SubOffer;
  nftData: Metadata;
  collection: string;
}

export class OffersStore {
  rootStore;
  offers: SubOfferData[] = [];
  filteredOffers: SubOfferData[] = [];
  pageOfferData: SubOfferData[] = []; // same type as offers, should describe it
  currentPage = 1;
  maxPage = 1;
  itemsPerPage = 16;
  filterCollection: Array<{ label: string; value: string }> = [];
  filterCollectionSelected: string[] = [];
  viewType: "grid" | "table" = "grid";
  isLoading = true;

  readyToFilter = true;
  filterAprMin = 1;
  filterAprMax = 99999;
  filterAmountMin = 1;
  filterAmountMax = 99999;
  filterDurationMin = 1;
  filterDurationMax = 90;
  filtersVisible = true;
  filterAprValidatorMin = 1;
  filterAprValidatorMax = 99999;
  filterAmountValidatorMin = 1;
  filterAmountValidatorMax = 99999;
  filterDurationValidatorMin = 1;
  filterDurationValidatorMax = 90;
  filterCurrency = "All";

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  private async fetchCollectionNamesForOffers<T extends SubOfferAccount>(
    offers: T[],
  ): Promise<Array<T & { collection: string }>> {
    try {
      const requests = offers.map((item) => ({
        request: axios.post("/api/collections/nft", { id: item.account.nftMint.toBase58() }),
      }));
      const responses = await axios.all(requests.map(async (request) => await request.request));

      responses.forEach((response) => {
        this.addFilterCollection(response.data);
      });

      return zipMap(offers, responses, (offer, response) => ({
        ...offer,
        collection: response?.data as string,
      }));
    } catch (e) {
      console.log(e);
      throw Error("Failed to load collection data");
    }
  }

  @action.bound addFilterCollection = (name: string): void => {
    if (this.filterCollection.find(({ value }) => value === name) === undefined)
      this.filterCollection.push({ label: name, value: name });
  };

  @action.bound setFilterCollection = (value: string): void => {
    const hasValue = this.filterCollectionSelected.map((e) => e).indexOf(value);

    if (hasValue === -1) this.filterCollectionSelected = [...this.filterCollectionSelected, value];
    else this.filterCollectionSelected.splice(hasValue, 1);

    this.currentPage = 1;
    void this.refetchOffers();
  };

  @action.bound setOffersData(data: SubOfferData[]): void {
    this.offers = data;
  }

  @action.bound setMaxPage(pages: number): void {
    this.maxPage = pages;
  }

  @action.bound setFilterCurrency(filterCurrency: string): void {
    if (filterCurrency === this.filterCurrency) return;

    this.filterCurrency = filterCurrency;
    this.currentPage = 1;
    void this.refetchOffers();
  }

  @action.bound setCurrentPage(page: number): void {
    this.currentPage = page;
    this.setPageOfferData([]);
    void this.getOffersForListings();
  }

  @action.bound setFilteredOffers(offers: SubOfferData[]): void {
    this.filteredOffers = offers;
  }

  @action.bound setViewType(viewType: "grid" | "table"): void {
    this.viewType = viewType;
  }

  @action.bound setFilterAprMin = (value: number): void => {
    this.filterAprMin = value;
    this.currentPage = 1;
    void this.refetchOffers();
  };

  @action.bound setFilterAprMax = (value: number): void => {
    this.filterAprMax = value;
    this.currentPage = 1;
    void this.refetchOffers();
  };

  @action.bound setFilterAmountMin = (value: number): void => {
    this.filterAmountMin = value;
    this.currentPage = 1;
    void this.refetchOffers();
  };

  @action.bound setFilterAmountMax = (value: number): void => {
    this.filterAmountMax = value;
    this.currentPage = 1;
    void this.refetchOffers();
  };

  @action.bound setFilterDurationMin = (value: number): void => {
    this.filterDurationMin = value;
    this.currentPage = 1;
    void this.refetchOffers();
  };

  @action.bound setFilterDurationMax = (value: number): void => {
    this.filterDurationMax = value;
    this.currentPage = 1;
    void this.refetchOffers();
  };

  private readonly getFiltersMinMaxValues = (
    data: SubOfferData[],
  ): {
    amountMax: number;
    durationsMin: number;
    aprMax: number;
    durationsMax: number;
    amountMin: number;
    aprMin: number;
  } => {
    const amounts: number[] = [];
    const durations: number[] = [];
    const aprs: number[] = [];

    data.forEach(({ account }) => {
      amounts.push(
        new BN(account.offerAmount).toNumber() /
          getDecimalsForOfferMint(account.offerMint.toBase58()),
      );
      aprs.push(new BN(account.aprNumerator).toNumber());
      durations.push(Math.floor(new BN(account.loanDuration).toNumber() / (3600 * 24)));
    });

    return {
      amountMin: Math.min(...amounts),
      amountMax: Math.max(...amounts),
      durationsMin: Math.min(...durations),
      durationsMax: Math.max(...durations),
      aprMin: Math.min(...aprs),
      aprMax: Math.max(...aprs),
    };
  };

  private static inRange(x: number, min: number, max: number): boolean {
    return (x - min) * (x - max) <= 0;
  }

  private handleFilters<T extends SubOfferData>(data: T[]): T[] {
    return data.filter(({ account, collection }) => {
      const currencyCheck =
        this.filterCurrency === "All" ||
        currencyMints[account.offerMint.toString()] === this.filterCurrency;

      const amountCheck = OffersStore.inRange(
        new BN(account.offerAmount).toNumber() /
          getDecimalsForOfferMint(account.offerMint.toString()),
        this.filterAmountMin,
        this.filterAmountMax,
      );

      const durationCheck = OffersStore.inRange(
        new BN(account.loanDuration).toNumber() / (3600 * 24),
        this.filterDurationMin,
        this.filterDurationMax,
      );

      const aprCheck = OffersStore.inRange(
        new BN(account.aprNumerator).toNumber(),
        this.filterAprMin,
        this.filterAprMax,
      );

      let collectionCheck: boolean = true;
      if (this.filterCollectionSelected.length > 0)
        collectionCheck = this.filterCollectionSelected.includes(collection);

      return currencyCheck && aprCheck && amountCheck && durationCheck && collectionCheck;
    });
  }

  @action.bound buildFilters = (): void => {
    const filterDef = this.getFiltersMinMaxValues(this.filteredOffers);
    this.filterAprMin = filterDef.aprMin;
    this.filterAprMax = filterDef.aprMax;
    this.filterAmountMin = filterDef.amountMin;
    this.filterAmountMax = filterDef.amountMax;
    this.filterDurationMin = filterDef.durationsMin;
    this.filterDurationMax = filterDef.durationsMax;

    this.filterAprValidatorMin = filterDef.aprMin;
    this.filterAprValidatorMax = filterDef.aprMax;
    this.filterAmountValidatorMin = filterDef.amountMin;
    this.filterAmountValidatorMax = filterDef.amountMax;
    this.filterDurationValidatorMin = filterDef.durationsMin;
    this.filterDurationValidatorMax = filterDef.durationsMax;
  };

  @action.bound setPageOfferData(pageOfferData: any[]): void {
    this.pageOfferData = pageOfferData;
  }

  async getOffersForListings(): Promise<void> {
    runInAction(() => (this.isLoading = true));

    const connection = this.rootStore.Wallet.connection;
    if (connection == null) {
      console.error("Not connected");
      return;
    }

    const subOfferKeys = await getFrontPageSubOffers(connection);
    const subOffers = (
      await GmaBuilder.make(connection, subOfferKeys).getAndMap((account) => {
        if (!account.exists) return null;
        return { pubkey: account.publicKey, account: SubOffer.deserialize(account.data)[0] };
      })
    ).filter((item): item is SubOfferAccount => item !== null);

    const nftPdas = subOffers.map((subOffer) => findMetadataPda(subOffer.account.nftMint));
    const nfts = await GmaBuilder.make(connection, nftPdas).getAndMap((account) => {
      if (!account.exists) return null;
      return Metadata.deserialize(account.data)[0];
    });

    const offersWithNftData = zipMap(subOffers, nfts, (subOffer, nftData) => ({
      nftData,
      ...subOffer,
    })).filter((item): item is SubOfferData => item.nftData !== null);
    const offersWithCollectionData = await this.fetchCollectionNamesForOffers(offersWithNftData);
    const filtered = this.handleFilters(offersWithCollectionData);
    const pageOffers = filtered.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage,
    );

    runInAction(() => {
      this.offers = offersWithCollectionData;
      this.filteredOffers = filtered;
      this.pageOfferData = pageOffers;
      this.maxPage = Math.ceil(this.filteredOffers.length / this.itemsPerPage);
      this.isLoading = false;
    });
  }

  @action.bound setFiltersVisible = (visible: boolean): void => {
    this.filtersVisible = visible;
  };

  @action.bound refetchOffers = async (): Promise<void> => {
    if (this.readyToFilter) {
      console.log("filter run");

      this.setOffersData([]);
      this.setPageOfferData([]);
      await this.getOffersForListings();
    }
  };

  @action.bound clearFilters = (): void => {
    this.filterCollectionSelected = [];
    this.setFilterCurrency("All");
    void this.refetchOffers();
  };
}
