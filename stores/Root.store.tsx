import { ProfileStore } from "@stores/Profile.store";

import { GlobalStateStore } from "./GlobalState.store";
import { InterfaceStore } from "./Interface.store";
import { LightboxStore } from "./Lightbox.store";
import { MyOffersStore } from "./MyOffers.store";
import { OffersStore } from "./Offers.store";
import { SingleOfferStore } from "./SingleOffer.store";
import { StakingStore } from "./Staking.store";
import { WalletStore } from "./Wallet.store";

export class RootStore {
  Wallet: WalletStore;
  Offers: OffersStore;
  Interface: InterfaceStore;
  SingleOffer: SingleOfferStore;
  MyOffers: MyOffersStore;
  Lightbox: LightboxStore;
  GlobalState: GlobalStateStore;
  StakingStore: StakingStore;
  ProfileStore: ProfileStore;

  constructor() {
    this.Wallet = new WalletStore(this);
    this.Offers = new OffersStore(this);
    this.Interface = new InterfaceStore(this);
    this.SingleOffer = new SingleOfferStore(this);
    this.MyOffers = new MyOffersStore(this);
    this.Lightbox = new LightboxStore(this);
    this.GlobalState = new GlobalStateStore(this);
    this.StakingStore = new StakingStore(this);
    this.ProfileStore = new ProfileStore(this);
  }
}

export const rootStore = new RootStore();
