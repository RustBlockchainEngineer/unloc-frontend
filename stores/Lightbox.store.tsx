import { action, makeAutoObservable } from "mobx";

type LightboxContent =
  | "loanCreate"
  | "loanUpdate"
  | "loanConfirm"
  | "collateral"
  | "processing"
  | "lendConfirmation"
  | "acceptOffer";

export interface IsubOfferData {
  offerAmount: number;
  loanDuration: number;
  aprNumerator: number;
  minRepaidNumerator: number;
  offerMint: string;
}

export interface ILightboxOffer {
  offerPublicKey: string;
  amount: string;
  APR: number;
  duration: string;
  totalRepay: string;
  currency: string;
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
  acceptOfferData: ILightboxOffer = {
    offerPublicKey: "",
    amount: "",
    APR: 0,
    duration: "",
    totalRepay: "",
    currency: "",
  };
  isAdditionalInfoOpened: boolean = false;

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

  @action.bound setAcceptOfferData(offer: ILightboxOffer) {
    this.acceptOfferData = offer;
  }

  @action.bound setAdditionalInfoOpened(isOpened: boolean) {
    this.isAdditionalInfoOpened = isOpened;
  }
}
