import { BigNumber } from "bignumber.js";

export const asBigNumber = (value: BigNumber.Value) => {
  const output = new BigNumber(value);

  return Number(output.toFixed());
};
