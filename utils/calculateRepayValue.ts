export const calculateRepayValue = (amount: number, apr: number, duration: number): string => {
  if (Number.isNaN(amount) || Number.isNaN(apr) || Number.isNaN(duration)) {
    return '0'
  }
  const totalRepay = amount + amount * ((apr / 36500) * duration)
  const totalRepayString = totalRepay.toLocaleString(undefined, {maximumFractionDigits: 4})
  return (totalRepayString.includes('.') || totalRepayString.includes('.')) ? totalRepayString : totalRepayString + '.00'
}
