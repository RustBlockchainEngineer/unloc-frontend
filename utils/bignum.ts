// eslint-disable-next-line import/named
import { bignum } from "@metaplex-foundation/beet";
import BN from "bn.js";

export function val(num: any): BN {
  if (BN.isBN(num)) return num;

  return new BN(num);
}

export function numVal(num: bignum): number {
  if (BN.isBN(num)) return num.toNumber();

  return num;
}

export const gt = (a: bignum, b: bignum): boolean => {
  if (typeof a === "number" && typeof b === "number") return a > b;
  else {
    const aBN = val(a);
    const bBN = val(b);
    return aBN.gt(bBN);
  }
};

export const gte = (a: bignum, b: bignum): boolean => {
  if (typeof a === "number" && typeof b === "number") return a >= b;
  else {
    const aBN = val(a);
    const bBN = val(b);
    return aBN.gte(bBN);
  }
};

export const eq = (a: bignum, b: bignum): boolean => {
  if (typeof a === "number" && typeof b === "number") return a === b;
  else {
    const aBN = val(a);
    const bBN = val(b);
    return aBN.eq(bBN);
  }
};

export const amountToUiAmount = (amount: BigInt | bignum, mintDecimals: number): number => {
  amount = typeof amount === "bigint" ? amount : BigInt(amount.toString());
  const decimals = BigInt(10 ** mintDecimals);
  const fractional = Number(amount.valueOf() % decimals) / Number(decimals);
  return Number(amount.valueOf() / decimals) + fractional;
};
