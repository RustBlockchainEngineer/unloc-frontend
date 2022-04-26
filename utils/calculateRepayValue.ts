export const calculateRepayValue = (amount: number, apr: number, days: number, denominator: number): string => {
  if (Number.isNaN(amount) || Number.isNaN(apr) || Number.isNaN(days) || Number.isNaN(denominator)) {
    return '0'
  }

  const accrued = (amount * apr * days) / (365 * (denominator / 100))
  const totalRepay = amount + accrued

  return totalRepay.toLocaleString(undefined, {maximumFractionDigits: 4, minimumFractionDigits: 2})
}
