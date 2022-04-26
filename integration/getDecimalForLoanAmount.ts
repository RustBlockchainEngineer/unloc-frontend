import { currencies, currencyMints } from '@constants/currency'

const getDecimalsForLoanAmount = (amount: number, offerMint: string): string => {
  return (amount / 10 ** currencies[currencyMints[offerMint]].decimals).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  })
}

export default getDecimalsForLoanAmount
