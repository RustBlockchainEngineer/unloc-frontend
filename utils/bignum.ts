import { bignum } from "@metaplex-foundation/beet";
import BN from "bn.js";

export function val(num: any) {
  if (BN.isBN(num)) {
    return num;
  }
  return new BN(num);
}

export const gt = (a: bignum, b: bignum) => {
  if (typeof a === "number" && typeof b === "number") {
    return a > b;
  } else {
    const aBN = val(a);
    const bBN = val(b);
    return aBN.gt(bBN);
  }
};

export const gte = (a: bignum, b: bignum) => {
  if (typeof a === "number" && typeof b === "number") {
    return a >= b;
  } else {
    const aBN = val(a);
    const bBN = val(b);
    return aBN.gte(bBN);
  }
};

export const eq = (a: bignum, b: bignum) => {
  if (typeof a === "number" && typeof b === "number") {
    return a === b;
  } else {
    const aBN = val(a);
    const bBN = val(b);
    return aBN.eq(bBN);
  }
};
