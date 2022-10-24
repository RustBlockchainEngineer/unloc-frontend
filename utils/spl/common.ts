import { bignum } from "@metaplex-foundation/beet";
import BN from "bn.js";

// TODO: IDK if this is correct
export const amountToUiAmount = (amount: BigInt | bignum, mintDecimals: number) => {
  amount = typeof amount === "bigint" ? amount : BigInt(amount.toString());
  const decimals = BigInt(10) ** BigInt(mintDecimals);
  const fractional = Number(amount.valueOf() % decimals) / Number(decimals);
  return Number(amount.valueOf() / decimals) + fractional;
};

// TODO: I sure hope this is not wrong
export const uiAmountToAmount = (amount: number | string, mintDecimals: number) => {
  amount = typeof amount === "number" ? amount.toString() : amount;

  if (amount === "0") {
    return new BN(0);
  }

  // Check if it doesn't have any decimal numbers
  const tokens = amount.split(".");
  if (tokens.length === 1) {
    return new BN(amount).mul(new BN(10).pow(new BN(mintDecimals)));
  }

  const fraction = tokens[1];
  if (fraction.length > mintDecimals) {
    throw Error("Invalid uiAmount conversion, too many decimals");
  }

  // The smaller the multiplication we need to do with regular numbers the better,
  // switching to BN or BigInt ASAP is preferred so there's less chance of overflow errors
  const converted = Number(amount) * 10 ** fraction.length;
  return new BN(converted).muln(10 ** (mintDecimals - fraction.length));
};
