import { action, flow, makeAutoObservable, reaction, values } from 'mobx'
import { PublicKey } from '@solana/web3.js'
import axios from 'axios'
import { BigNumber } from 'bignumber.js'

import {
  getSubOfferList,
  MultipleNFT,
  SubOfferState,
  getSubOfferMultiple,
  checkWalletATA,
  acceptOffer
} from '../integration/nftLoan'
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
  filtersVisible = true

  offersKeys: PublicKey[] = []
  offersCount: number = 0
  offersKnown: any[] = []
  offersEmpty: boolean = true

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  private addCollectionToNFTCollections(collection: string): void {
    this.nftCollections = this.nftCollections.includes(collection)
      ? this.nftCollections
      : this.nftCollections.concat(collection)
  }

  @action.bound fetchCollectionForNfts = flow(function* (this: OffersStore) {
    this.filterCollection = []

    try {
      const requests = this.pageOfferData.map((item, index) => ({
        request: axios.post('/api/collections/nft', { id: item.nftMint.toBase58() }),
        index
      }))
      const responses = yield axios.all(requests.map((request) => request.request))

      for (const el of requests) {
        this.pageOfferData[el.index].collection = responses[el.index].data
        this.addCollectionToNFTCollections(responses[el.index].data)
      }

      this.buildFilterCollection()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  })

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
    this.pageNFTData = []
    this.pageOfferData = []
    this.getOffersForListings()
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
    this.offersCount = count
  }

  private initManyNfts = async (nftMintKeys: PublicKey[]) => {
    const multipleNft = new MultipleNFT(nftMintKeys)
    await multipleNft.initialize()
    await multipleNft.initArweavedata()

    return multipleNft
  }

  @action.bound getOffersForListings = async (): Promise<void> => {
    const activeOffersKeys = await getSubOffersKeysByState([0]) //add more filters

    let offersViable: any[] = []

    if (activeOffersKeys && activeOffersKeys.length) {
      offersViable = [...offersViable, ...activeOffersKeys]
    }

    // if (reusedOffersKeys && reusedOffersKeys.length) {
    //   offersViable = [...offersViable, ...reusedOffersKeys]
    // }

    if (offersViable && offersViable.length) {
      this.offersEmpty = false
      this.setOffersKeys(offersViable)
      this.setOffersCount(offersViable?.length)

      const offersData = await getSubOfferMultiple(this.offersKeys)
      const offersCountedOnNft = countDuplicatesToProperty(offersData, 'nftMint', 'count')
      this.setMaxPage(Math.ceil(offersCountedOnNft.length / this.itemsPerPage))

      const nftMintKeys = removeDuplicatesByPropertyIncludes(offersCountedOnNft, 'nftMint')
      const nftHandled: any[] = []

      nftMintKeys.forEach((key) => {
        const mint = key.toBase58()
        if (!nftHandled.includes(mint)) {
          nftHandled.push(mint)
        }
      })
      const keysTrimmed = nftHandled.map((key) => new PublicKey(key))
      if (offersData && offersData) {
        const offersByNFT = offersCountedOnNft.map((resultItem: any) => {
          const element = offersCountedOnNft.find((item: any) => item.nftMint === resultItem.nftMint.toBase58)
          return element ? element : resultItem
        })

        const paginatedOffersData = offersByNFT.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        )

        this.pageOfferData = paginatedOffersData

        if (keysTrimmed && keysTrimmed.length) {
          const data = await this.initManyNfts(keysTrimmed)
          const paginatedNFTData = data.metadatas.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          )

          this.pageNFTData = paginatedNFTData
        }
      }
    } else {
      this.pageOfferData = []
      this.pageNFTData = []
      this.offersEmpty = true
    }
  }

  @action.bound setFiltersVisible = (visible: boolean): void => {
    this.filtersVisible = visible
  }

  @action.bound setOffersEmpty = (offersEmpty: boolean) => {
    this.offersEmpty = offersEmpty
  }

  @action.bound handleAcceptOffer = async (offerPublicKey: string) => {
    await acceptOffer(new PublicKey(offerPublicKey))
  }

  @action.bound refetchOffers = async () => {
    await this.getOffersForListings()
    await this.fetchCollectionForNfts()
  }
}
