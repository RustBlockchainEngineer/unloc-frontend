export const exitAmount = (amount: number): string => {
  return (amount * 1.1).toLocaleString("en-us", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
};
