import { formatOptions } from "@constants/config";

/**
 * Calculates the APR of a loan, given the borrowed amount, earned interest at maturity,
 * and the duration of the loan in days until the borrower defaults.
 * @param amount
 * @param interest
 * @param days
 * @param denominator
 * @returns {number} APR
 */
export const calculateApr = (
  amount: number,
  interest: number,
  days: number,
  denominator: number,
): number => {
  if (isNaN(amount) || isNaN(interest) || isNaN(days) || isNaN(denominator)) {
    return 0;
  }

  return (interest * denominator * 365) / (amount * days);
};

/**
 * Calculates the interest accrued at the maturity of the loan, given the borrowed amount,
 * APR and the duration in days.
 * @param amount
 * @param apr
 * @param days
 * @param denominator
 * @returns {number}
 */
export const calculateInterest = (
  amount: number,
  apr: number,
  days: number,
  denominator: number,
): number => {
  if (isNaN(amount) || isNaN(apr) || isNaN(days) || isNaN(denominator)) {
    return 0;
  }

  return (amount * apr * days) / (365 * denominator);
};

/**
 * Calculates the repay amount of a loan given the principle amount, apr,
 * maximum duration and the denominator used in the smart contract.
 * @param amount
 * @param apr
 * @param duration
 * @param denominator
 * @returns {string}
 */
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
  return (amount + gain).toLocaleString("en-us", formatOptions);
};
