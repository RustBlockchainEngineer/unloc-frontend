import { WalletStore } from './Wallet.store'

export class RootStore {
  Wallet: WalletStore
  // Offers: OffersStore
  // SingleOffer: SingleOfferStore
  // UserWallet: UserWalletStore
  // LoanActions: LoanActionsStore

  constructor() {
    this.Wallet = new WalletStore(this)
    // this.Offers = new OffersStore(this)
    // this.SingleOffer = new SingleOfferStore(this)
    // this.UserWallet = new UserWalletStore(this)
    // this.LoanActions = new LoanActionsStore(this)
  }
}

export const rootStore = new RootStore()
