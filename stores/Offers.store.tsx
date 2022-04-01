import { action, flow, makeAutoObservable, reaction, values } from 'mobx'
import { PublicKey } from '@solana/web3.js'
import axios from 'axios'

import { getSubOfferList, MultipleNFT, SubOfferState } from '../integration/nftLoan'
import { getUniqueNFTsByNFTMint } from '../methods/getUniqueNFTsByNFTMint'
import sortNftsByField from '../methods/sortNftsByField'

export class OffersStore {
  rootStore
  offers: any[] = []
  filteredOffers: any[] = []
  currentPage = 1
  maxPage = 1
  itemsPerPage = 16
  nftCollections: string[] = []
  collectionFilters: { label: string; value: string }[] = []
  collectionFilterSelected: string[] = []
  refresh = false
  viewType: 'grid' | 'table' = 'grid'
  filterAprMin = 1
  filterAprMax = 2000 //take this value dynamically from offers
  filterAmountMin = 1
  filterAmountMax = 1000 //take this value dynamically from offers
  filterDurationMin = 1
  filterDurationMax = 90

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore

    // reaction(
    //   () => this.currentPage,
    //   () => this.refreshShownNFTs()
    // )
  }

  private filterShownNFTs(offers: any[], collectionFilters: string[]): any[] {
    const prefiltered =
      collectionFilters.length > 0 ? offers.filter((item) => collectionFilters.includes(item.collection)) : offers
    const filtered = prefiltered.filter((item) => item.account.state === 0)

    return filtered
  }

  // questionable
  private sliceShownNFTs(offers: any[], currentPage: number, itemsPerPage: number): any[] {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + (itemsPerPage < offers.length ? itemsPerPage : offers.length)

    const sliced = offers.slice(start, end)

    return sliced
  }

  // questionable
  @action.bound refreshShownNFTs(): void {
    try {
      // const filteredSubOffers = this.filterShownNFTs(this.offers, this.collectionFilters)
      // const sortedSubOffers = sortNftsByField(filteredSubOffers, 'name')
      // const slicedSubOffers = this.sliceShownNFTs(sortedSubOffers, this.currentPage, this.itemsPerPage)
      // this.setMaxPage(Math.ceil(filteredSubOffers.length / this.itemsPerPage))
      // this.setFilteredOffers(slicedSubOffers)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  @action.bound fetchCollectionForNfts = flow(function* (this: OffersStore) {
    this.resetNFTCollections()

    try {
      const offers = this.offers
      const requests = offers.map((offer, index) => ({
        request: axios.post('/api/collections/nft', { id: offer.account.nftMint.toBase58() }),
        index
      }))
      const responses = yield axios.all(requests.map((request) => request.request))

      for (const el of requests) {
        offers[el.index].collection = responses[el.index].data
        if (offers[el.index].account.state === 0) this.addToNFTCollections(responses[el.index].data)
      }

      this.buildCollectionFilters()
      this.setOffersData(offers)
      // console.log('offers: ', offers)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  })

  // This function still needs to be splitted into separate ones with single responsibility updating the store state asynchronously
  @action.bound fetchOffers = flow(function* (this: OffersStore) {
    try {
      const allSubOffers: any[] = yield getSubOfferList(undefined, undefined, SubOfferState.Proposed)
      const _allSubOffers: any[] = getUniqueNFTsByNFTMint(allSubOffers)
      const newSubOffers: any[] = []
      const nftMintKeys: PublicKey[] = []

      for (let i = 0; i < _allSubOffers.length; i++) {
        const nftMint = _allSubOffers[i].account.nftMint
        if (!nftMintKeys.includes(nftMint)) {
          nftMintKeys.push(nftMint)
        }
      }

      const multipleNft = new MultipleNFT(nftMintKeys)
      yield multipleNft.initialize()
      yield multipleNft.initArweavedata()

      for (let i = 0; i < _allSubOffers.length; i++) {
        try {
          const nftMint = _allSubOffers[i].account.nftMint
          const nftMeta = multipleNft.getNftMeta(nftMint)

          if (nftMeta) {
            _allSubOffers[i].nftMeta = nftMeta
            newSubOffers.push(_allSubOffers[i])
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e)
        }
      }
      // console.log('newSubOffers: ', newSubOffers)
      this.setOffersData(newSubOffers)
      // this.refreshShownNFTs()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  })

  @action.bound resetNFTCollections(): void {
    this.nftCollections = []
  }

  private addToNFTCollections(collection: string): void {
    this.nftCollections = this.nftCollections.includes(collection)
      ? this.nftCollections
      : this.nftCollections.concat(collection)
  }

  @action.bound setCollectionFilters = (value: string[]): void => {
    value.forEach((item) => {
      const hasValue = this.collectionFilterSelected.indexOf(item)

      if (hasValue === -1) {
        this.collectionFilterSelected.push(item)
      } else {
        this.collectionFilterSelected.splice(hasValue, 1)
      }
    })
  }

  @action.bound buildCollectionFilters = () => {
    this.collectionFilters = this.nftCollections.map((collection) => {
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
}
