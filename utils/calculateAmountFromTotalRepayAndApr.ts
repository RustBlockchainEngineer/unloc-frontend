export const calculateAprFromTotalRepayAndApr = (
  totalRepay: number,
  apr: number,
  duration: number,
  denominator: number,
): string => {
  if (
    Number.isNaN(totalRepay) ||
    Number.isNaN(apr) ||
    Number.isNaN(duration) ||
    Number.isNaN(denominator)
  ) {
    return "0";
  }

  const amount = (apr * duration * totalRepay) / (apr * duration + 1) / denominator;

  console.log(amount);

  return amount.toFixed(Math.log10(denominator));
};
