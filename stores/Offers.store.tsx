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
import { asBigNumber } from '../utils/asBigNumber'

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
  filterAprMax = 10000 //take this value dynamically from offers
  filterAmountMin = 1
  filterAmountMax = 10000 //take this value dynamically from offers
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
      console.log(this.pageOfferData, this.pageOfferData.length)
      console.log(this.pageOfferData.forEach((offer) => console.log(offer, offer.nftMint)))
      const requests = this.pageOfferData.map((item, index) => {
        return {
          request: axios.post('/api/collections/nft', { id: item.nftMint.toBase58() }),
          index
        }
      })
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
    this.refetchOffers()
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
    this.refetchOffers()
  }

  @action.bound setFilterAprMax = (value: number): void => {
    this.filterAprMax = value
    this.refetchOffers()
  }

  @action.bound setFilterAmountMin = (value: number): void => {
    this.filterAmountMin = value
    this.refetchOffers()
  }

  @action.bound setFilterAmountMax = (value: number): void => {
    this.filterAmountMax = value
    this.refetchOffers()
  }

  @action.bound setFilterDurationMin = (value: number): void => {
    this.filterDurationMin = value
    this.refetchOffers()
  }

  @action.bound setFilterDurationMax = (value: number): void => {
    this.filterDurationMax = value
    this.refetchOffers()
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

  private getFiltersMinMaxValues = (data: any) => {
    const amounts: number[] = []
    const durations: number[] = []
    const aprs: number[] = []

    data.forEach(
      (offer: {
        offerAmount: { toNumber: () => number }
        aprNumerator: BigNumber.Value
        loanDuration: { toNumber: () => number }
      }) => {
        amounts.push(offer.offerAmount.toNumber() / 1000000)
        aprs.push(asBigNumber(offer.aprNumerator))
        durations.push(Math.floor(offer.loanDuration.toNumber() / (3600 * 24)))
      }
    )

    return {
      amountMin: Math.min(...amounts),
      amountMax: Math.max(...amounts),
      durationsMin: Math.min(...durations),
      durationsMax: Math.max(...durations),
      aprMin: Math.min(...aprs),
      aprMax: Math.max(...aprs)
    }
  }

  private inRange(x: number, min: number, max: number) {
    return (x - min) * (x - max) <= 0
  }

  private handleFilters = (data: any) => {
    const output: any[] = []

    data.forEach((offer: any) => {
      const amountCheck = this.inRange(
        offer.offerAmount.toNumber() / 1000000,
        this.filterAmountMin,
        this.filterAmountMax
      )
      const durationCheck = this.inRange(
        offer.loanDuration.toNumber() / (3600 * 24),
        this.filterDurationMin,
        this.filterDurationMax
      )
      const aprCheck = this.inRange(asBigNumber(offer.aprNumerator), this.filterAprMin, this.filterAprMax)

      if (aprCheck && amountCheck && durationCheck) {
        output.push(offer)
      }
    })

    return output
  }

  @action.bound buildFilters = (offers: any[]) => {
    const filterDef = this.getFiltersMinMaxValues(offers)
    this.filterAprMin = filterDef.aprMin
    this.filterAprMax = filterDef.aprMax
    this.filterAmountMin = filterDef.amountMin
    this.filterAmountMax = filterDef.amountMax
    this.filterDurationMin = filterDef.durationsMin
    this.filterDurationMax = filterDef.durationsMax
  }

  @action.bound getOffersForListings = async (): Promise<void> => {
    // IMPORTANT - Add check for active suboffers as right now even if Colletarable has an active subOffer
    // we're still showing rest of its offers on the page and they should be hidden in this case
    const activeOffersKeys = await getSubOffersKeysByState([0])
    let offersViable: any[] = []

    if (activeOffersKeys && activeOffersKeys.length) {
      offersViable = [...offersViable, ...activeOffersKeys]

      if (offersViable && offersViable.length) {
        this.offersEmpty = false
        this.setOffersKeys(offersViable)
        this.setOffersCount(offersViable?.length)

        const offersData = await getSubOfferMultiple(this.offersKeys)
        const offersWithKeys = activeOffersKeys.map((subOfferKey, index) => {
          return {
            ...offersData[index],
            subOfferKey: subOfferKey
          }
        })

        this.filteredOffers = this.handleFilters(offersWithKeys)
        // this needs to be affected by filters
        this.setMaxPage(Math.ceil(this.filteredOffers.length / this.itemsPerPage))

        if (this.filteredOffers && this.filteredOffers.length) {
          const nftMints = this.filteredOffers.map((offerData: any) => {
            return offerData.nftMint
          })
          const data = await this.initManyNfts(nftMints)
          const paginatedNFTData = data.metadatas.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          )
          this.pageOfferData = this.filteredOffers
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
    this.pageNFTData = []
    this.pageOfferData = []
    await this.getOffersForListings()
    await this.fetchCollectionForNfts()
  }
}
