export const calculateRepayValue = (amount: number, apr: number, duration: number): string => {
  if (Number.isNaN(amount) || Number.isNaN(apr) || Number.isNaN(duration)) {
    return '0'
  }
  const totalRepay = amount + amount * ((apr / 36500) * duration)
  return totalRepay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4})
}
