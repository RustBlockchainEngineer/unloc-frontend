export const calculateRepayValue = (
  amount: number,
  apr: number,
  duration: number,
  denominator: number,
): string => {
  if (
    Number.isNaN(amount) ||
    Number.isNaN(apr) ||
    Number.isNaN(duration) ||
    Number.isNaN(denominator)
  ) {
    return "0";
  }

  const gain = amount * ((apr / 36500) * duration);
  return formatRepayValue(amount, gain);
};

export const formatRepayValue = (amount: number, accrued: number): string => {
  if (Number.isNaN(amount) || Number.isNaN(accrued)) {
    return "0";
  }

  return (amount + accrued).toLocaleString("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
    useGrouping: false,
  });
};
