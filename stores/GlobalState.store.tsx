import * as anchor from "@project-serum/anchor";
import { action, flow, makeAutoObservable } from "mobx";
import { getGlobalState } from "@integration/nftLoan";

export class GlobalStateStore {
  rootStore;
  accruedInterestNumerator = 0;
  aprNumerator = 0;
  denominator = 0;
  expireDurationForLender = 0;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action.bound fetchGlobalState = flow(function* (this: GlobalStateStore) {
    const globalState = yield getGlobalState();

    if (globalState) {
      this.setAccruedInterestNumerator(globalState.accruedInterestNumerator);
      this.setAprNumerator(globalState.aprNumerator);
      this.setDenominator(globalState.denominator);
      this.setExpireDurationForLender(globalState.expireDurationForLender);
    }
  });

  @action.bound setAccruedInterestNumerator(accruedInterestNumerator: anchor.BN): void {
    this.accruedInterestNumerator = accruedInterestNumerator.toNumber();
  }

  @action.bound setAprNumerator(aprNumerator: anchor.BN): void {
    this.aprNumerator = aprNumerator.toNumber();
  }

  @action.bound setDenominator(denominator: anchor.BN): void {
    this.denominator = denominator.toNumber();
  }

  @action.bound setExpireDurationForLender(expireDurationForLender: anchor.BN): void {
    this.expireDurationForLender = expireDurationForLender.toNumber();
  }
}
