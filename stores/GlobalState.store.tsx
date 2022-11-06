import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { GlobalState } from "@unloc-dev/unloc-sdk-loan";
import BN from "bn.js";
import { makeAutoObservable, runInAction } from "mobx";

import { GLOBAL_STATE_TAG, NFT_LOAN_PID } from "@constants/config";
import { numVal } from "@utils/bignum";

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
  skipPreflight = false;
  currentTime = 0;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  async fetchGlobalState(connection: Connection): Promise<void> {
    const [globalState] = PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], NFT_LOAN_PID);
    const data = await GlobalState.fromAccountAddress(connection, globalState);

    runInAction(() => {
      if (data) {
        this.accruedInterestNumerator = numVal(data.accruedInterestNumerator);
        this.aprNumerator = numVal(data.aprNumerator);
        this.denominator = numVal(data.denominator);
        this.expireLoanDuration = numVal(data.expireLoanDuration);
      }
    });
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

  setSkipPreflight(value: boolean) {
    this.skipPreflight = value;
  }

  setTimer(value: number) {
    this.currentTime = value;
  }

  increaseTimer() {
    // Secondly
    this.currentTime += 1;
  }
}
