import { config } from "@constants/config";
import { currencies } from "@constants/currency";
import { USDC_MINT_DEVNET, USDC_MINT } from "@constants/currency-constants";
import { Connection, PublicKey } from "@solana/web3.js";
import { action, flow, makeAutoObservable } from "mobx";

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

  @action.bound fetchSolBalance = flow(function* (
    this: WalletStore,
    connection: Connection,
    publicKey: PublicKey,
  ) {
    const solAmount = yield connection.getBalance(publicKey);
    this.setSolAmount(solAmount / 10 ** currencies.SOL.decimals);
  });

  @action.bound fetchUsdcBalance = async (
    connection: Connection,
    publicKey: PublicKey,
  ): Promise<void> => {
    let usdcAmount = 0;

    const usdcTokenAccounts = (
      await connection.getTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(config.devnet ? USDC_MINT_DEVNET : USDC_MINT),
      })
    ).value;

    for (const account of usdcTokenAccounts) {
      const { uiAmount } = (await connection.getTokenAccountBalance(account.pubkey)).value;

      if (uiAmount === null) {
        continue;
      }

      usdcAmount += uiAmount;
    }

    this.setUsdcAmount(usdcAmount);
  };

  @action.bound setConnected(connected: boolean): void {
    this.connected = connected;
  }

  @action.bound setWallet(wallet: any): void {
    this.wallet = wallet;
  }

  @action.bound setConnection(connection: any): void {
    this.connection = connection;
  }

  @action.bound setHandleDisconnect(disconnect: any): void {
    this.disconnect = disconnect;
  }

  @action.bound handleDisconnect(): void {
    this.disconnect();
    this.walletKey = undefined;
    this.connected = false; // we might need to flush data on this action in different stores also, TBD
  }

  @action.bound handleWalletError(error: any): void {
    console.log(error);
  }

  @action.bound setWalletKey(key: PublicKey): void {
    this.walletKey = key;
  }

  @action.bound setSolAmount(solAmount: number): void {
    this.solAmount = solAmount;
  }

  @action.bound setUsdcAmount(usdcAmount: number): void {
    this.usdcAmount = usdcAmount;
  }
}
