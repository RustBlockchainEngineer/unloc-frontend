import { action, makeAutoObservable, flow } from 'mobx'
import axios from 'axios'
import * as anchor from '@project-serum/anchor'

import { getSubOffer, getSubOfferList } from '../integration/nftLoan'
import { currencies, currencyMints } from '../constants/currency'
import { IOfferData } from '../@types/IOfferData'
import { PublicKey } from '@solana/web3.js'
import { getMetadata } from '../integration/nftIntegration'
import getDecimalsForLoanAmount from '../integration/getDecimalForLoanAmount'
import { getSubOffersKeysByState } from '../integration/offersListing'
import { calculateRepayValue } from '../utils/calculateRepayValue'
import { asBigNumber } from '../utils/asBigNumber'

interface LoanInterface {
  id: string
  status: number
  amount: string
  currency: string
  duration: number
  apr: number
  offerMint: string
  publicKey: anchor.web3.PublicKey
  totalRepay?: any
}

export class SingleOfferStore {
  rootStore
  nftData = {} as IOfferData
  loansData: any[] = []

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  @action.bound fetchNft = flow(function* (this: SingleOfferStore, id: string) {
    const subOfferKey = new anchor.web3.PublicKey(id)
    const metadata = yield getMetadata(subOfferKey)
    const collection = yield axios.post('/api/collections/nft', { id: subOfferKey.toBase58() })
    if (collection && metadata && metadata.arweaveMetadata) {
      this.setNftData({
        ...metadata.arweaveMetadata,
        collection: collection.data,
        mint: subOfferKey.toBase58()
      })
    }
  })

  @action.bound fetchSubOffers = async (id: string): Promise<void> => {
    try {
      const subOfferKey = new anchor.web3.PublicKey(id)

      const data = await getSubOfferList(undefined, subOfferKey, 0)
      const loansArr: Array<LoanInterface> = []
      data.forEach(
        (element: {
          publicKey: PublicKey
          account: {
            state: any
            offerAmount: { toNumber: () => number }
            offerMint: { toBase58: () => string }
            loanDuration: { toNumber: () => any }
            aprNumerator: { toNumber: () => any }
          }
        }): void => {
          const amountConvered = getDecimalsForLoanAmount(
            element.account.offerAmount.toNumber(),
            element.account.offerMint.toBase58()
          )
          const durationConverted = Math.floor(element.account.loanDuration.toNumber() / (3600 * 24))
          const aprConverted = asBigNumber(element.account.aprNumerator as any)

          loansArr.push({
            id: element.publicKey.toBase58(),
            status: element.account.state,
            amount: amountConvered,
            currency: 'USDC',
            duration: durationConverted, // suspecting wrong type here, also we are showing loans with 0 day duration this is wrong
            apr: aprConverted,
            offerMint: element.account.offerMint.toBase58(),
            publicKey: element.publicKey,
            totalRepay: calculateRepayValue(Number(amountConvered), aprConverted, durationConverted)
          })
        }
      )

      this.setLoansData(loansArr)
    } catch (e) {
      console.log(e)
    }
  }

  @action.bound setNftData = (data: IOfferData): void => {
    this.nftData = data
  }

  @action.bound setLoansData = (data: any[]): void => {
    this.loansData = data
  }

  @action.bound getSubOffersByNft = async (): Promise<void> => {
    const activeOffers = await getSubOffersKeysByState([0])
  }
}
