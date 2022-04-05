import { action, makeAutoObservable } from 'mobx'

export class WalletStore {
  rootStore
  connected = false
  wallet = undefined
  connection: any

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  @action.bound setConnected(connected: boolean): void {
    this.connected = connected
  }

  @action.bound setWallet(wallet: any): void {
    this.wallet = wallet
  }

  @action.bound setConnection(connection: any): void {
    this.connection = connection
  }

  @action.bound handleWalletError(error: any): void {
    console.log(error)
  }
}
