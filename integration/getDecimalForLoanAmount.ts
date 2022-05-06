import { currencies, currencyMints } from '@constants/currency'

export const getDecimalsForLoanAmount = (amount: number, offerMint: string): number => {
  return +(amount / 10 ** currencies[currencyMints[offerMint]].decimals).toFixed(4)
}

export const getDecimalsForLoanAmountAsString = (
  amount: number,
  offerMint: string,
  minDigits = 2,
  maxDigits = 4
): string => {
  return (amount / 10 ** currencies[currencyMints[offerMint]].decimals).toLocaleString(undefined, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits
  })
}

export const getDecimalsForOfferMint = (offerMint: string): number => {
  return 10 ** currencies[currencyMints[offerMint]].decimals
}
