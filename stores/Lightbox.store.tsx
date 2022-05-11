import { action, makeAutoObservable } from "mobx";

type LightboxContent =
  | "loanCreate"
  | "loanUpdate"
  | "collateral"
  | "processing"
  | "lendConfirmation";

export interface IsubOfferData {
  offerAmount: number;
  loanDuration: number;
  aprNumerator: number;
  minRepaidNumerator: number;
  offerMint: string;
}

export class LightboxStore {
  rootStore;
  visible: boolean = false;
  content: LightboxContent = "collateral";
  canClose: boolean = true;
  activeSubOffer: string = "";
  activeSubOfferData: IsubOfferData = {
    offerAmount: 0,
    loanDuration: 0,
    aprNumerator: 0,
    minRepaidNumerator: 0,
    offerMint: "",
  };

  lendConfirmationData: any = {};

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action.bound setVisible(visible: boolean) {
    this.visible = visible;
  }

  @action.bound setContent(content: LightboxContent) {
    this.content = content;
  }

  @action.bound setCanClose(canClose: boolean) {
    this.canClose = canClose;
  }

  @action.bound setActiveSubOffer(subOfferKey: string) {
    this.activeSubOffer = subOfferKey;
  }

  @action.bound setActiveSubOfferData(subOfferData: IsubOfferData) {
    this.activeSubOfferData = subOfferData;
  }

  @action.bound setLendConfirmationData(offer: any) {
    this.lendConfirmationData = offer;
  }
}
