import { PublicKey } from '@solana/web3.js'
import { action, makeAutoObservable } from 'mobx'

export class WalletStore {
  rootStore
  connected = false
  wallet = undefined
  connection: any
  disconnect: any
  walletKey: PublicKey | undefined

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

  @action.bound setHandleDisconnect(disconnect: any): void {
    this.disconnect = disconnect
  }

  @action.bound handleDisconnect(): void {
    this.disconnect()
    this.walletKey = undefined
    this.connected = false // we might need to flush data on this action in different stores also, TBD
  }

  @action.bound handleWalletError(error: any): void {
    console.log(error)
  }

  @action.bound setWalletKey(key: PublicKey): void {
    this.walletKey = key
  }
}
