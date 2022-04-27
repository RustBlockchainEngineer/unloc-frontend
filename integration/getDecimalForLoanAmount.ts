import { currencies, currencyMints } from '@constants/currency'

export const getDecimalsForLoanAmount = (amount: number, offerMint: string): number => {
  return +(amount / 10 ** currencies[currencyMints[offerMint]].decimals).toFixed(4)
}

export const getDecimalsForLoanAmountAsString = (amount: number, offerMint: string, minDigits = 2): string => {
  return (amount / 10 ** currencies[currencyMints[offerMint]].decimals).toLocaleString(undefined, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: 4
  })
}
