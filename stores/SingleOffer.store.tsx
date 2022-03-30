import { action, makeAutoObservable, flow } from 'mobx'
import axios from 'axios'
import * as anchor from '@project-serum/anchor'

import { getSubOffer, getSubOfferList } from '../functions/nftLoan'
import { currencies, currencyMints } from '../constants/locales/currency'
import { IOfferData } from '../@types/IOfferData'
import { PublicKey } from '@solana/web3.js'
import { getMetadata } from '../functions/nftItegration'
import getDecimalsForLoanAmount from '../functions/getDecimalsForLoanAmount'

interface LoanInterface {
  id: string
  status: number
  amount: string
  currency: string
  duration: number
  apr: number
  offerMint: string
  publicKey: anchor.web3.PublicKey
}

export class SingleOfferStore {
  rootStore
  nftData = {} as IOfferData
  loansData: any[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  @action.bound fetchNft = flow(function* (this: SingleOfferStore, id: string) {
    const subOfferKey = new anchor.web3.PublicKey(id)
    const _subOfferData: any = yield getSubOffer(subOfferKey) // we need to stop depend on this function so much, this can be simplified
    _subOfferData.publicKey = subOfferKey
    const metadata = yield getMetadata(_subOfferData.nftMint)
    const collection = yield axios.post('/api/collections/nft', { id: _subOfferData.nftMint.toBase58() })

    this.setNftData({
      collection,
      metadata,
      mint: _subOfferData.nftMint.toBase58()
    })
  })

  @action.bound fetchSubOffers = flow(function* (this: SingleOfferStore, id: string) {
    const subOfferKey = new anchor.web3.PublicKey(id)
    const _subOfferData: any = yield getSubOffer(subOfferKey)
    _subOfferData.publicKey = subOfferKey

    const data = yield getSubOfferList(undefined, _subOfferData?.nftMint, undefined)

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
        loansArr.push({
          id: element.publicKey.toBase58(),
          status: element.account.state,
          amount: getDecimalsForLoanAmount(
            element.account.offerAmount.toNumber(),
            element.account.offerMint.toBase58()
          ),
          currency: 'USDC',
          duration: element.account.loanDuration.toNumber(), // suspecting wrong type here, also we are showing loans with 0 day duration this is wrong
          apr: element.account.aprNumerator.toNumber(),
          offerMint: element.account.offerMint.toBase58(),
          publicKey: element.publicKey
        })
      }
    )

    this.setLoansData(loansArr)
  })

  @action.bound setNftData = (data: IOfferData): void => {
    this.nftData = data
  }

  @action.bound setLoansData = (data: any[]): void => {
    this.loansData = data
  }
}
