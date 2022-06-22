import { action, makeAutoObservable } from "mobx";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { getDurationForContractData } from "@utils/timeUtils/timeUtils";
import { createSubOffer, updateSubOffer } from "@integration/nftLoan";
import { CurrencyTypes } from "@constants/currency-constants";
import { currencies } from "@constants/currency";

export interface SubOfferInterface {
  loanvalue: number;
  currency: CurrencyTypes;
  duration: string;
  apr: number;
}
export class LoanActionsStore {
  rootStore;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action.bound async handleNewSubOffer(
    data: SubOfferInterface,
    nftMint: PublicKey,
  ): Promise<void> {
    try {
      const currencyInfo = currencies[data.currency];

      await createSubOffer(
        new BN(data.loanvalue * 10 ** currencyInfo.decimals),
        new BN(getDurationForContractData(Number(data.duration), "days")),
        new BN(data.apr),
        new PublicKey(nftMint),
        new PublicKey(currencyInfo.mint),
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  @action.bound async handleEditSubOffer(
    data: {
      currency: CurrencyTypes;
      loanvalue: number;
      duration: string;
      apr: string | number | BN | number[] | Uint8Array | Buffer;
    },
    subOffer: PublicKey,
  ): Promise<void> {
    try {
      const currencyInfo = currencies[data.currency];

      await updateSubOffer(
        new BN(data.loanvalue * 10 ** currencyInfo.decimals),
        new BN(getDurationForContractData(Number(data.duration), "days")),
        new BN(data.apr),
        subOffer,
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
