import { makeAutoObservable, runInAction } from "mobx";
import { Connection, PublicKey } from "@solana/web3.js";
import { GLOBAL_STATE_TAG, NFT_LOAN_PID } from "@constants/config";
import { GlobalState } from "@unloc-dev/unloc-loan-solita";
import BN from "bn.js";

export class GlobalStateStore {
  rootStore;
  accruedInterestNumerator = 0;
  aprNumerator = 0;
  denominator = 0;
  expireLoanDuration = 0;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  async fetchGlobalState(connection: Connection) {
    const [globalState] = PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], NFT_LOAN_PID);
    const data = await GlobalState.fromAccountAddress(connection, globalState);

    runInAction(() => {
      if (data) {
        this.accruedInterestNumerator = new BN(data.accruedInterestNumerator).toNumber();
        this.aprNumerator = new BN(data.aprNumerator).toNumber();
        this.denominator = new BN(data.denominator).toNumber();
        this.expireLoanDuration = new BN(data.expireLoanDuration).toNumber();
      }
    });
  }

  setAccruedInterestNumerator(accruedInterestNumerator: BN): void {
    this.accruedInterestNumerator = accruedInterestNumerator.toNumber();
  }

  setAprNumerator(aprNumerator: BN): void {
    this.aprNumerator = aprNumerator.toNumber();
  }

  setDenominator(denominator: BN): void {
    this.denominator = denominator.toNumber();
  }

  setExpireLoanDuration(expireLoanDuration: BN): void {
    this.expireLoanDuration = expireLoanDuration.toNumber();
  }
}
