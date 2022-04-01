import { config } from './config'

export const currencyMints: Record<string, string> = config.devnet
  ? {
      ExW7Yek3vsRJcapsdRKcxF9XRRS8zigLZ8nqqdqnWgQi: 'USDC',
      So11111111111111111111111111111111111111112: 'SOL'
    }
  : {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC',
      So11111111111111111111111111111111111111112: 'SOL'
    }
export const currencies: Record<string, CurrencyInfo> = config.devnet
  ? {
      USDC: { mint: 'ExW7Yek3vsRJcapsdRKcxF9XRRS8zigLZ8nqqdqnWgQi', decimals: 6 },
      SOL: { mint: 'So11111111111111111111111111111111111111112', decimals: 9 }
    }
  : {
      USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
      SOL: { mint: 'So11111111111111111111111111111111111111112', decimals: 9 }
    }
type CurrencyInfo = {
  mint: string
  decimals: number
}
