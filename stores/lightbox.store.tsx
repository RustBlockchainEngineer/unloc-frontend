import { PublicKey } from '@solana/web3.js'
import { action, makeAutoObservable } from 'mobx'

export interface ILightBoxData {
  loanValue: number
  duration: number
  minRepaid: number
  apr: number
  offerMint: string
  subOffer: PublicKey
}

export class LightboxStore {
  rootStore
  showLightboxLoan: 'create' | 'update' | null = null
  showLightboxCollateral = false
  lightboxLoanData: ILightBoxData | null = null
  offerNftMint: PublicKey | null = null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  @action.bound setOfferNftMint(offerNftMint: PublicKey | null): void {
    this.offerNftMint = offerNftMint
  }

  @action.bound setLightboxLoanData(data: ILightBoxData | null) {
    this.lightboxLoanData = data
  }

  @action.bound setShowLightboxLoan(showLightboxLoan: 'create' | 'update' | null): void {
    this.showLightboxLoan = showLightboxLoan
  }

  @action.bound setShowLightboxCollateral(showLightboxCollateral: boolean): void {
    this.showLightboxCollateral = showLightboxCollateral
  }

  @action.bound hideAllLightboxes(): void {
    this.setShowLightboxLoan(null)
    this.setLightboxLoanData(null)
    this.setOfferNftMint(null)
    this.setShowLightboxCollateral(false)
  }
}
