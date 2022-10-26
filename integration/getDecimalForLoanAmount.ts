import { formatOptions } from "@constants/config";
import { currencies, currencyMints } from "@constants/currency";

export const getDecimalsForLoanAmount = (amount: number, offerMint: string): number => {
  return +(amount / 10 ** currencies[currencyMints[offerMint]].decimals).toFixed(4);
};

export const getDecimalsForLoanAmountAsString = (
  amount: number,
  offerMint: string,
  minDigits?: number,
  maxDigits?: number,
): string => {
  const uiAmount = amount / 10 ** currencies[currencyMints[offerMint]]?.decimals;

  if (minDigits ?? maxDigits)
    return uiAmount.toLocaleString("en-US", {
      minimumFractionDigits: minDigits ?? 2,
      maximumFractionDigits: maxDigits ?? 4,
      useGrouping: false,
    });

  return uiAmount.toLocaleString("en-US", formatOptions);
};

export const getDecimalsForOfferMint = (offerMint: string): number => {
  return 10 ** currencies[currencyMints[offerMint]].decimals;
};
