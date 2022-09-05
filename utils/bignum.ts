import { bignum } from "@metaplex-foundation/beet";
import BN from "bn.js";

export const gt = (a: bignum, b: bignum) => {
  if (typeof a === "number" && typeof b === "number") {
    return a > b;
  } else {
    const aBN = BN.isBN(a) ? a : new BN(a);
    const bBN = BN.isBN(b) ? b : new BN(b);
    return aBN.gt(bBN);
  }
};

export const gte = (a: bignum, b: bignum) => {
  if (typeof a === "number" && typeof b === "number") {
    return a >= b;
  } else {
    const aBN = BN.isBN(a) ? a : new BN(a);
    const bBN = BN.isBN(b) ? b : new BN(b);
    return aBN.gte(bBN);
  }
};

export const eq = (a: bignum, b: bignum) => {
  if (typeof a === "number" && typeof b === "number") {
    return a === b;
  } else {
    const aBN = BN.isBN(a) ? a : new BN(a);
    const bBN = BN.isBN(b) ? b : new BN(b);
    return aBN.eq(bBN);
  }
};
