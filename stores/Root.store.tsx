import { WalletStore } from './Wallet.store'
import { OffersStore } from './Offers.store'
import { InterfaceStore } from './Interface.store'
import { SingleOfferStore } from './SingleOffer.store'
import { MyOffersStore } from './MyOffers.store'
import { LightboxStore } from './Lightbox.store'
import { LoanActionsStore } from './LoanActionStore'
export class RootStore {
  Wallet: WalletStore
  Offers: OffersStore
  Interface: InterfaceStore
  SingleOffer: SingleOfferStore
  MyOffers: MyOffersStore
  Lightbox: LightboxStore
  // UserWallet: UserWalletStore
  LoanActions: LoanActionsStore

  constructor() {
    this.Wallet = new WalletStore(this)
    this.Offers = new OffersStore(this)
    this.Interface = new InterfaceStore(this)
    this.SingleOffer = new SingleOfferStore(this)
    this.MyOffers = new MyOffersStore(this)
    this.Lightbox = new LightboxStore(this)
    this.LoanActions = new LoanActionsStore(this)
  }
}

export const rootStore = new RootStore()
