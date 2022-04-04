import { WalletStore } from './Wallet.store'
import { OffersStore } from './Offers.store'
import { InterfaceStore } from './Interface.store'
import { SingleOfferStore } from './SingleOffer.store'
import { MyOffersStore } from './MyOffers.store'

export class RootStore {
  Wallet: WalletStore
  Offers: OffersStore
  Interface: InterfaceStore
  SingleOffer: SingleOfferStore
  MyOffers: MyOffersStore
  // UserWallet: UserWalletStore
  // LoanActions: LoanActionsStore

  constructor() {
    this.Wallet = new WalletStore(this)
    this.Offers = new OffersStore(this)
    this.Interface = new InterfaceStore(this)
    this.SingleOffer = new SingleOfferStore(this)
    this.MyOffers = new MyOffersStore(this)
    // this.LoanActions = new LoanActionsStore(this)
  }
}

export const rootStore = new RootStore()
