import { action, makeAutoObservable, runInAction, flow } from 'mobx'
import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js'

import { getWhitelistedNFTsByWallet } from '@integration/nftIntegration'
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
  claimCollateral
} from '@integration/nftLoan'
import { currencies, currencyMints } from '@constants/currency'
import { getDurationForContractData } from '@utils/getDuration'
import { getSubOffersKeysByState } from '@integration/offersListing'

export class MyOffersStore {
  rootStore
  offers: any[] = []
  collaterables = []
  subOffers: any[] = []
  nftData: NFTMetadata[] = []
  activeNftMint: string = ''
  lendingList: any[] = []

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
      console.log('test')

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

  @action.bound handleCreateSubOffer = async (
    nftMint: string,
    offerAmount: number,
    loanDuration: number,
    aprNumerator: number,
    currency: string
  ) => {
    const currencyInfo = currencies[currency]

    await createSubOffer(
      new BN(offerAmount * 10 ** currencyInfo.decimals),
      new BN(getDurationForContractData(loanDuration, 'days')),
      new BN(1), // minRepaidNumerator
      new BN(aprNumerator),
      new PublicKey(nftMint),
      new PublicKey(currencyInfo.mint)
    )
  }

  @action.bound handleRepayLoan = async (subOfferKey: string) => {
    await repayLoan(new PublicKey(subOfferKey))
  }

  @action.bound setActiveNftMint = (nftMint: string) => {
    this.activeNftMint = nftMint
  }

  @action.bound refetchStoreData = async () => {
    await this.getOffersByWallet(this.rootStore.Wallet.walletKey)
    await this.getNFTsData()
    await this.getSubOffersByOffers()
  }

  @action.bound createCollateral = async (mint: string) => {
    await setOffer(new PublicKey(mint))
  }

  @action.bound handleCancelCollateral = async (mint: string) => {
    await cancelOffer(new PublicKey(mint))
  }

  @action.bound handleCancelSubOffer = async (subOfferKey: string) => {
    await cancelSubOffer(new PublicKey(subOfferKey))
  }

  @action.bound handleEditSubOffer = async (
    offerAmount: number,
    loanDuration: number,
    aprNumerator: number,
    minRepaidNumerator: number,
    subOffer: string
  ) => {
    const currencyInfo = currencies[currencyMints[this.rootStore.Lightbox.activeSubOfferData.offerMint]]

    await updateSubOffer(
      new BN(offerAmount * 10 ** currencyInfo.decimals),
      new BN(getDurationForContractData(loanDuration, 'days')),
      new BN(minRepaidNumerator),
      new BN(aprNumerator),
      new PublicKey(subOffer)
    )
  }

  private initManyNfts = async (nftMintKeys: PublicKey[]) => {
    const multipleNft = new MultipleNFT(nftMintKeys)
    await multipleNft.initialize()
    await multipleNft.initArweavedata()

    return multipleNft
  }

  @action.bound fetchUserLendedOffers = async () => {
    const activeOffersKeys = await getSubOffersKeysByState([1])
    if (activeOffersKeys && activeOffersKeys.length) {
      const offersData = await getSubOfferMultiple(activeOffersKeys)

      const lendedLoans: any[] = []

      offersData.forEach((offer: any) => {
        if (offer.lender.toBase58() === this.rootStore.Wallet.walletKey.toBase58()) {
          lendedLoans.push(offer)
        }
      })

      const nftMints = lendedLoans.map((offerData: any) => {
        return offerData.nftMint
      })
      const nftsData = await this.initManyNfts(nftMints)

      nftsData.metadatas.forEach((nft, index) => {
        lendedLoans[index].nftData = nft
      })

      this.lendingList = lendedLoans
    }
  }

  @action.bound handleClaimCollateral = async (subOffer: PublicKey) => {
    await claimCollateral(subOffer)
  }
}
