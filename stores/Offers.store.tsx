import { action, flow, makeAutoObservable, reaction } from 'mobx'
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
  collectionFilters: string[] = []
  refresh = false
  viewType: 'grid' | 'table' = 'grid'

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore

    reaction(
      () => this.currentPage,
      () => this.refreshShownNFTs()
    )
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
      const filteredSubOffers = this.filterShownNFTs(this.offers, this.collectionFilters)
      const sortedSubOffers = sortNftsByField(filteredSubOffers, 'name')
      const slicedSubOffers = this.sliceShownNFTs(sortedSubOffers, this.currentPage, this.itemsPerPage)

      this.setMaxPage(Math.ceil(filteredSubOffers.length / this.itemsPerPage))
      this.setFilteredOffers(slicedSubOffers)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  @action.bound fetchCollectionForNfts = flow(function* (this: OffersStore) {
    this.resetNFTCollectionsCollections()

    try {
      const offers = this.offers
      const requests = offers.map((offer, index) => ({
        request: axios.post('/api/collections/nft', { id: offer.account.nftMint.toBase58() }),
        index
      }))
      const responses = yield axios.all(requests.map((request) => request.request))

      for (const el of requests) {
        offers[el.index].collection = responses[el.index].data
        if (offers[el.index].account.state === 0) this.addCollectionToNFTCollections(responses[el.index].data)
      }

      console.log(offers)
      this.setOffersData(offers)
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
      console.log('newSubOffers: ', newSubOffers)
      this.setOffersData(newSubOffers)
      this.refreshShownNFTs()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  })

  @action.bound resetNFTCollectionsCollections(): void {
    this.nftCollections = []
  }

  private addCollectionToNFTCollections(collection: string): void {
    this.nftCollections = this.nftCollections.includes(collection)
      ? this.nftCollections
      : this.nftCollections.concat(collection)
  }

  @action.bound setCollectionFilters = (flt: string | string[]): void => {
    if (Array.isArray(flt)) {
      this.collectionFilters = flt
    } else if (this.collectionFilters.includes(flt)) {
      this.collectionFilters = this.collectionFilters.filter((f) => f !== flt)
    } else {
      this.collectionFilters.push(flt)
    }
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
}
