import { currencies, currencyMints } from '@constants/currency'

const getDecimalsForLoanAmount = (amount: number, offerMint: string): string => {
  return (amount / 10 ** currencies[currencyMints[offerMint]].decimals).toFixed(4)
}

export default getDecimalsForLoanAmount
