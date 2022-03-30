import { action, makeAutoObservable } from 'mobx'
import BN from 'bn.js'
import { PublicKey } from '@solana/web3.js'

import { config } from '../constants/config'
import { getDurationForContractData } from '../functions/getDuration'
import { createSubOffer, updateSubOffer } from '../functions/nftLoan'

export type Ticker = 'USDC' | 'SOL'

export interface SubOfferInterface {
  loanvalue: number
  currency: Ticker
  duration: number
  apr: number
}

export interface CurrencyInfo {
  mint: string
  decimals: number
}

export const currencyMints: Record<string, Ticker> = config.devnet
  ? {
      ExW7Yek3vsRJcapsdRKcxF9XRRS8zigLZ8nqqdqnWgQi: 'USDC',
      So11111111111111111111111111111111111111112: 'SOL'
    }
  : {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC',
      So11111111111111111111111111111111111111112: 'SOL'
    }

export const currencies: Record<Ticker, CurrencyInfo> = config.devnet
  ? {
      USDC: { mint: 'ExW7Yek3vsRJcapsdRKcxF9XRRS8zigLZ8nqqdqnWgQi', decimals: 6 },
      SOL: { mint: 'So11111111111111111111111111111111111111112', decimals: 9 }
    }
  : {
      USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
      SOL: { mint: 'So11111111111111111111111111111111111111112', decimals: 9 }
    }

export class LoanActionsStore {
  rootStore

  constructor(rootStore: any) {
    makeAutoObservable(this)
    this.rootStore = rootStore
  }

  @action.bound async handleNewSubOffer(data: SubOfferInterface, nftMint: PublicKey): Promise<void> {
    try {
      const currencyInfo = currencies[data.currency]

      await createSubOffer(
        new BN(data.loanvalue * 10 ** currencyInfo.decimals),
        new BN(getDurationForContractData(data.duration, 'days')),
        // minRepaidNumerator
        new BN(1),
        new BN(data.apr),
        new PublicKey(nftMint),
        new PublicKey(currencyInfo.mint)
      )
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  @action.bound async handleEditSubOffer(
    data: {
      currency: Ticker
      loanvalue: number
      duration: number
      apr: string | number | BN | number[] | Uint8Array | Buffer
    },
    subOffer: PublicKey
  ): Promise<void> {
    try {
      const currencyInfo = currencies[data.currency]

      await updateSubOffer(
        new BN(data.loanvalue * 10 ** currencyInfo.decimals),
        new BN(getDurationForContractData(data.duration, 'days')),
        // minRepaidNumerator
        new BN(1),
        new BN(data.apr),
        subOffer
      )
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }
}
