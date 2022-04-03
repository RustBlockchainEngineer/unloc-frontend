import { action, flow, makeAutoObservable, reaction, values } from 'mobx'
import { PublicKey } from '@solana/web3.js'
import axios from 'axios'
import { BigNumber } from 'bignumber.js'

import { getSubOfferList, MultipleNFT, SubOfferState, getSubOfferMultiple } from '../integration/nftLoan'
import { getSubOffersKeysByState } from '../integration/offersListing'
import { getUniqueNFTsByNFTMint } from '../methods/getUniqueNFTsByNFTMint'
import sortNftsByField from '../methods/sortNftsByField'
import { removeDuplicatesByPropertyIncludes } from '../utils/removeDuplicatesByPropertyIncludes'
import { countDuplicatesToProperty } from '../utils/countDuplicatesToProperty'

export class OffersStore {
  rootStore
  offers: any[] = []
  filteredOffers: any[] = []
  currentPage = 1
  maxPage = 1
  itemsPerPage = 16
  pageOfferData: any[] = [] // same type as offers, should describe it
  pageNFTData: any[] = []
  nftCollections: string[] = []
  filterCollection: { label: string; value: string }[] = []
  filterCollectionSelected: string[] = []
  refresh = false // not sure if this is really needed
  viewType: 'grid' | 'table' = 'grid'
  filterAprMin = 1
  filterAprMax = 2000 //take this value dynamically from offers
  filterAmountMin = 1
  filterAmountMax = 1000 //take this value dynamically from offers
  filterDurationMin = 1
  filterDurationMax = 90

  //new paginated offers:
  offersKeys: PublicKey[] = []
  offersCount: number = 0

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore

    // reaction(
    //   () => this.currentPage,
    //   () => this.refreshShownNFTs()
    // )
  }

  // questionable
  // @action.bound refreshShownNFTs(): void {
  //   try {
  //     // const filteredSubOffers = this.filterShownNFTs(this.offers, this.collectionFilters)
  //     // const sortedSubOffers = sortNftsByField(filteredSubOffers, 'name')
  //     // const slicedSubOffers = this.sliceShownNFTs(sortedSubOffers, this.currentPage, this.itemsPerPage)
  //     // this.setMaxPage(Math.ceil(filteredSubOffers.length / this.itemsPerPage))
  //     // this.setFilteredOffers(slicedSubOffers)
  //   } catch (e) {
  //     // eslint-disable-next-line no-console
  //     console.log(e)
  //   }
  // }

  @action.bound resetNFTCollections(): void {
    this.nftCollections = []
  }

  @action.bound setFilterCollection = (value: string[]): void => {
    value.forEach((item) => {
      const hasValue = this.filterCollection.map((e) => e.value).indexOf(item)

      if (hasValue === -1) {
        this.filterCollectionSelected.push(item)
      } else {
        this.filterCollectionSelected.splice(hasValue, 1)
      }
    })
  }

  @action.bound buildFilterCollection = () => {
    this.filterCollection = this.nftCollections.map((collection) => {
      return { label: collection, value: collection }
    })
  }

  @action.bound setOffersData(data: any[]): void {
    this.offers = data
  }

  @action.bound setMaxPage(pages: number): void {
    this.maxPage = pages
  }

  @action.bound setCurrentPage(page: number): void {
    this.currentPage = page
  }

  @action.bound setFilteredOffers(offers: any[]): void {
    this.filteredOffers = offers
  }

  @action.bound setViewType(viewType: 'grid' | 'table'): void {
    this.viewType = viewType
  }

  @action.bound setFilterAprMin = (value: number): void => {
    this.filterAprMin = value
  }

  @action.bound setFilterAprMax = (value: number): void => {
    this.filterAprMax = value
  }

  @action.bound setFilterAmountMin = (value: number): void => {
    this.filterAmountMin = value
  }

  @action.bound setFilterAmountMax = (value: number): void => {
    this.filterAmountMax = value
  }

  @action.bound setFilterDurationMin = (value: number): void => {
    this.filterDurationMin = value
  }

  @action.bound setFilterDurationMax = (value: number): void => {
    this.filterDurationMax = value
  }

  @action.bound setOffersKeys = (values: PublicKey[]): void => {
    this.offersKeys = values
  }

  @action.bound setOffersCount = (count: number): void => {
    // console.log(count)
    this.offersCount = count
  }

  private initManyNfts = async (nftMintKeys: PublicKey[]) => {
    const multipleNft = new MultipleNFT(nftMintKeys)
    await multipleNft.initialize()
    await multipleNft.initArweavedata()

    return multipleNft
  }

  @action.bound getOffersForListings = async (): Promise<void> => {
    const activeOffersKeys = await getSubOffersKeysByState([0])

    if (activeOffersKeys && activeOffersKeys.length) {
      this.setOffersKeys(activeOffersKeys)
      this.setOffersCount(activeOffersKeys?.length)
    }

    const paginatedOffersPK = this.offersKeys.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    )

    const offersData = await getSubOfferMultiple(paginatedOffersPK)

    if (offersData) {
      const resultOffers = countDuplicatesToProperty(offersData, 'nftMint', 'count')
      this.pageOfferData = resultOffers

      const nftMintKeys = removeDuplicatesByPropertyIncludes(offersData, 'nftMint')

      if (nftMintKeys && nftMintKeys.length) {
        const data = await this.initManyNfts(nftMintKeys)
        this.pageNFTData = data.metadatas
      }
    }
  }
}
