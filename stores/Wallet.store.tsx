import { PublicKey } from "@solana/web3.js";
import { makeAutoObservable } from "mobx";

export class WalletStore {
  rootStore;
  connected = false;
  wallet = undefined;
  connection: any;
  disconnect: any;
  walletKey: PublicKey | undefined;
  solAmount = 0;
  usdcAmount = 0;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setConnected(connected: boolean): void {
    this.connected = connected;
  }

  setWallet(wallet: any): void {
    this.wallet = wallet;
  }

  setConnection(connection: any): void {
    this.connection = connection;
  }

  setHandleDisconnect(disconnect: any): void {
    this.disconnect = disconnect;
  }

  handleDisconnect(): void {
    this.disconnect();
    this.walletKey = undefined;
    this.connected = false; // we might need to flush data on this action in different stores also, TBD
  }

  handleWalletError(error: any): void {
    console.log(error);
  }

  setWalletKey(key: PublicKey): void {
    this.walletKey = key;
  }

  setSolAmount(solAmount: number): void {
    this.solAmount = solAmount;
  }

  setUsdcAmount(usdcAmount: number): void {
    this.usdcAmount = usdcAmount;
  }
}
