import { action, makeAutoObservable, runInAction, flow } from 'mobx'
import { PublicKey } from '@solana/web3.js'

import { getWhitelistedNFTsByWallet } from '../integration/nftIntegration'
import { getOffersBy, getSubOfferList, MultipleNFT, NFTMetadata } from '../integration/nftLoan'

export class MyOffersStore {
  rootStore
  offers: any[] = []
  collaterables = []
  subOffers: any[] = []
  nftData: NFTMetadata[] = []

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  private filterOffersByState(offers: any[], state: number) {
    return offers.filter((offer) => offer.account.state === state)
  }

  @action.bound setOffers(offers: never[]): void {
    this.offers = offers
  }

  @action.bound async getOffersByWallet(wallet: PublicKey): Promise<void> {
    const offersData = await getOffersBy(wallet, undefined, undefined)
    const proposedOffers = this.filterOffersByState(offersData, 0)
    const activeOffers = this.filterOffersByState(offersData, 1)

    if (offersData) {
      runInAction(() => {
        this.setOffers([...activeOffers, ...proposedOffers] as any)
      })
    }
  }

  @action.bound setCollaterables(collaterables: never[]): void {
    this.collaterables = collaterables
  }

  @action.bound async getUserNFTs(wallet: PublicKey): Promise<void> {
    const data = await getWhitelistedNFTsByWallet(wallet)

    if (data) {
      runInAction(() => {
        this.setCollaterables(data as any)
      })
    }
  }

  @action.bound setNftData(nftData: never[]): void {
    this.nftData = nftData
  }

  @action.bound setSubOffers(subOffers: never[]): void {
    this.subOffers = subOffers
  }

  @action.bound getSubOffersByOffers = flow(function* (this: MyOffersStore) {
    if (this.offers && this.offers.length > 0) {
      const data = []
      for (const offer of this.offers) {
        if (offer && offer.publicKey) {
          const subOfferData = yield getSubOfferList(offer.publicKey)
          data.push(subOfferData)
        }
      }

      this.subOffers = data.flat()
    }
  })

  @action.bound getNFTsData = flow(function* (this: MyOffersStore) {
    if (this.offers && this.offers.length > 0) {
      const data: NFTMetadata[] = []
      const nftMintKeys: PublicKey[] = []

      for (const offer of this.offers) {
        const nftMint = offer.account.nftMint

        if (!nftMintKeys.includes(nftMint.toBase58())) {
          nftMintKeys.push(nftMint)
        }
      }

      const multipleNft = new MultipleNFT(nftMintKeys)
      yield multipleNft.initialize()
      yield multipleNft.initArweavedata()

      for (const nftMint of nftMintKeys) {
        const nftMeta = multipleNft.getNftMeta(nftMint)

        if (nftMeta) {
          data.push(nftMeta)
        }
      }

      this.nftData = data
    }
  })
}
