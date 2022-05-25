import { action, flow, makeAutoObservable } from "mobx";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { MultipleNFT, getSubOfferMultiple, acceptOffer, NFTMetadata } from "@integration/nftLoan";
import { getSubOffersKeysByState } from "@integration/offersListing";
import { removeDuplicatesByPropertyIndex } from "@utils/removeDuplicatesByPropertyIndex";
import { getDecimalsForOfferMint } from "@integration/getDecimalForLoanAmount";
import { currencyMints } from "@constants/currency";
import { SubOffer } from "../@types/loans";

export interface SubOfferData extends SubOffer {
  subOfferKey: PublicKey;
  collection?: string; // Lazy loaded
  nftData?: NFTMetadata; // Lazy loaded
}

export class OffersStore {
  rootStore;
  offers: SubOfferData[] = [];
  offersRef: SubOfferData[] = [];
  filteredOffers: SubOfferData[] = [];
  currentPage = 1;
  maxPage = 1;
  itemsPerPage = 16;
  pageOfferData: SubOfferData[] = []; // same type as offers, should describe it
  pageNFTData: NFTMetadata[] = [];
  nftCollections: string[] = [];
  filterCollection: { label: string; value: string }[] = [];
  filterCollectionSelected: string[] = [];
  refresh = false; // not sure if this is really needed
  viewType: "grid" | "table" = "grid";

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

  offersKeys: PublicKey[] = [];
  offersCount: number = 0;
  offersKnown: any[] = [];
  offersEmpty: boolean = true;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  private addCollectionToNFTCollections(collection: string): void {
    this.nftCollections = this.nftCollections.includes(collection)
      ? this.nftCollections
      : this.nftCollections.concat(collection);
  }

  @action.bound fetchCollectionForNfts = flow(function* (this: OffersStore) {
    try {
      const requests = this.offers.map((item, index) => {
        return {
          request: axios.post("/api/collections/nft", { id: item.nftMint.toBase58() }),
          index,
        };
      });
      const responses = yield axios.all(requests.map((request) => request.request));

      for (const el of requests) {
        if (this.offers[el.index] && !this.offers[el.index].hasOwnProperty("collection")) {
          this.offers[el.index].collection = responses[el.index].data;
          this.addCollectionToNFTCollections(responses[el.index].data);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  });

  @action.bound resetNFTCollections(): void {
    this.nftCollections = [];
  }

  @action.bound setFilterCollection = (value: string): void => {
    const hasValue = this.filterCollectionSelected.map((e) => e).indexOf(value);

    if (hasValue === -1) {
      this.filterCollectionSelected = [...this.filterCollectionSelected, value];
    } else {
      this.filterCollectionSelected.splice(hasValue, 1);
    }

    this.currentPage = 1;
    this.refetchOffers();
  };

  @action.bound buildFilterCollection = () => {
    this.filterCollection = this.nftCollections.map((collection) => {
      return { label: collection, value: collection };
    });
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
    this.refetchOffers();
  }

  @action.bound setPageNFTData(pageNFTData: NFTMetadata[]): void {
    this.pageNFTData = pageNFTData;
  }

  @action.bound setCurrentPage(page: number): void {
    this.currentPage = page;
    this.pageNFTData = [];
    this.setPageOfferData([]);
    this.getOffersForListings();
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
    this.refetchOffers();
  };

  @action.bound setFilterAprMax = (value: number): void => {
    this.filterAprMax = value;
    this.currentPage = 1;
    this.refetchOffers();
  };

  @action.bound setFilterAmountMin = (value: number): void => {
    this.filterAmountMin = value;
    this.currentPage = 1;
    this.refetchOffers();
  };

  @action.bound setFilterAmountMax = (value: number): void => {
    this.filterAmountMax = value;
    this.currentPage = 1;
    this.refetchOffers();
  };

  @action.bound setFilterDurationMin = (value: number): void => {
    this.filterDurationMin = value;
    this.currentPage = 1;
    this.refetchOffers();
  };

  @action.bound setFilterDurationMax = (value: number): void => {
    this.filterDurationMax = value;
    this.currentPage = 1;
    this.refetchOffers();
  };

  @action.bound setOffersKeys = (values: PublicKey[]): void => {
    this.offersKeys = values;
  };

  @action.bound setOffersCount = (count: number): void => {
    this.offersCount = count;
  };

  private initManyNfts = async (nftMintKeys: PublicKey[]) => {
    const multipleNft = new MultipleNFT(nftMintKeys);
    await multipleNft.initialize();
    await multipleNft.initArweavedata();

    return multipleNft;
  };

  private getFiltersMinMaxValues = (data: SubOfferData[]) => {
    const amounts: number[] = [];
    const durations: number[] = [];
    const aprs: number[] = [];

    data.forEach((offer) => {
      amounts.push(
        offer.offerAmount.toNumber() / getDecimalsForOfferMint(offer.offerMint.toBase58()),
      );
      aprs.push(offer.aprNumerator.toNumber());
      durations.push(Math.floor(offer.loanDuration.toNumber() / (3600 * 24)));
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

  private inRange(x: number, min: number, max: number) {
    return (x - min) * (x - max) <= 0;
  }

  private handleFilters = (data: SubOfferData[]) => {
    return data.filter((offer) => {
      const currencyCheck =
        this.filterCurrency === "All" ||
        currencyMints[offer.offerMint.toString()] === this.filterCurrency;

      const amountCheck = this.inRange(
        offer.offerAmount.toNumber() / getDecimalsForOfferMint(offer.offerMint.toString()),
        this.filterAmountMin,
        this.filterAmountMax,
      );

      const durationCheck = this.inRange(
        offer.loanDuration.toNumber() / (3600 * 24),
        this.filterDurationMin,
        this.filterDurationMax,
      );

      const aprCheck = this.inRange(
        offer.aprNumerator.toNumber(),
        this.filterAprMin,
        this.filterAprMax,
      );

      return currencyCheck && aprCheck && amountCheck && durationCheck;
    });
  };

  private handleCollectionFilter = () => {
    const output: any[] = [];
    if (this.filterCollectionSelected && this.filterCollectionSelected.length) {
      this.filterCollectionSelected.forEach((collection) => {
        this.offers.forEach((offer) => {
          if (offer.collection === collection) {
            output.push(offer);
          }
        });
      });
      return output;
    } else {
      return this.offers;
    }
  };

  @action.bound buildFilters = (offers: any[]) => {
    const filterDef = this.getFiltersMinMaxValues(offers);
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

  private mangleNftData = () => {
    const output: any[] = [];
    if (this.pageNFTData && this.pageNFTData.length) {
      this.offers.forEach((offer) => {
        removeDuplicatesByPropertyIndex(this.pageNFTData, "mint").forEach((nftData) => {
          if (offer.nftMint.toBase58() === nftData.mint) {
            if (
              output.findIndex(
                (item) => item.subOfferKey.toBase58() === offer.subOfferKey.toBase58(),
              ) === -1
            ) {
              output.push({ ...offer, nftData: nftData });
            }
          }
        });
      });

      return output;
    } else {
      return this.offers;
    }
  };

  @action.bound setPageOfferData(pageOfferData: any[]): void {
    this.pageOfferData = pageOfferData;
  }

  @action.bound getOffersForListings = async (): Promise<void> => {
    const proposedOffersKeys = await getSubOffersKeysByState([0]);

    if (proposedOffersKeys?.length) {
      this.setOffersEmpty(false);
      this.setOffersKeys(proposedOffersKeys);
      this.setOffersCount(proposedOffersKeys?.length);

      const offersData = await getSubOfferMultiple(this.offersKeys, 0);
      if (offersData?.length) {
        const nftMints = offersData.map((offerData: any) => {
          return offerData.nftMint;
        });

        const data = await this.initManyNfts(nftMints);
        const paginatedNFTData = data.metadatas.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage,
        );

        this.setPageNFTData(paginatedNFTData);
        this.setOffersData(this.handleFilters(offersData));

        await this.fetchCollectionForNfts();

        this.setOffersData(this.handleCollectionFilter());
        this.offersRef = this.offers;

        const finalData = this.mangleNftData();
        if (finalData && finalData.length > 16) {
          this.setPageOfferData(
            finalData.slice(
              (this.currentPage - 1) * this.itemsPerPage,
              this.currentPage * this.itemsPerPage,
            ),
          );
        } else {
          this.setPageOfferData(finalData);
        }

        this.setMaxPage(Math.ceil(this.offersRef.length / this.itemsPerPage));

        if (this.pageOfferData?.length === 0) {
          // This stops the home page from showing an infinite loading loop
          this.setPageNFTData([]);
          this.setOffersEmpty(true);
        }
      }
    } else {
      this.setPageOfferData([]);
      this.setPageNFTData([]);
      this.setOffersEmpty(true);
    }
  };

  @action.bound setFiltersVisible = (visible: boolean): void => {
    this.filtersVisible = visible;
  };

  @action.bound setOffersEmpty = (offersEmpty: boolean) => {
    this.offersEmpty = offersEmpty;
  };

  @action.bound handleAcceptOffer = async (offerPublicKey: string) => {
    await acceptOffer(new PublicKey(offerPublicKey));
  };

  @action.bound refetchOffers = async () => {
    if (this.readyToFilter) {
      console.log("filter run");

      this.setOffersData([]);
      this.setPageNFTData([]);
      this.setPageOfferData([]);
      await this.getOffersForListings();
    }
  };

  @action.bound clearFilters = () => {
    this.filterCollectionSelected = [];
    // this.filterCollection = []
    this.refetchOffers();
  };
}
