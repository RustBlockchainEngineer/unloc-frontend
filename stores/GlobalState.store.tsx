import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { GlobalState } from "@unloc-dev/unloc-loan-solita";
import BN from "bn.js";
import { makeAutoObservable, runInAction } from "mobx";

import { GLOBAL_STATE_TAG, NFT_LOAN_PID } from "@constants/config";

export class GlobalStateStore {
  rootStore;
  accruedInterestNumerator = 0;
  aprNumerator = 0;
  denominator = 0;
  expireDurationForLender = 0;
  endpoints = ["devnet", "localnet", "mainnet"];
  endpoint = "devnet";
  expireLoanDuration = 0;
  commitmentLevels: Commitment[] = ["processed", "confirmed", "finalized"];
  selectedCommitment: Commitment = "confirmed";

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  async fetchGlobalState(connection: Connection): Promise<void> {
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

  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  setCommitment(level: Commitment): void {
    this.selectedCommitment = level;
  }
}
