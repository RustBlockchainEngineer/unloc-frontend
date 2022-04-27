export const calculateRepayValue = (amount: number, apr: number, duration: number): string => {
  if (Number.isNaN(amount) || Number.isNaN(apr) || Number.isNaN(duration)) {
    return '0'
  }

  const gain = amount * ((apr / 36500) * duration)
  return (
    amount.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 2 })
    +
    ' + '
    +
    gain.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 2 })
  )
}
