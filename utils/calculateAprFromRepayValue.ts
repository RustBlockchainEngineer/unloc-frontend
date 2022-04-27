export const calculateAprFromRepayValue = (amount: number, repay: number, days: number, denominator: number): string => {
  if (Number.isNaN(amount) || Number.isNaN(repay) || Number.isNaN(days) || Number.isNaN(denominator)) {
    return '0'
  }

  const accrued = repay - amount
  const apr = (365 * (denominator / 100) * accrued) / (days * amount)

  return apr.toFixed(2)
}
