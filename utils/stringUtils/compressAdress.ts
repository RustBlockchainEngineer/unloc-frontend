import { PublicKey } from "@solana/web3.js";

export const compressAddress = (charLen: number, address: string | PublicKey): string => {
  address = typeof address === "string" ? address : address?.toBase58();
  return (
    address?.slice(0, charLen) + "..." + address?.slice(address.length - charLen, address.length)
  );
};
