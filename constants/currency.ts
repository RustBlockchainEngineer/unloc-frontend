import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import {
  CurrencyTypes,
  SOL,
  SOL_MINT,
  SOL_MINT_DEVNET,
  USDC,
  USDC_MINT,
  USDC_MINT_DEVNET,
} from "@constants/currency-constants";

import { config } from "./config";

interface CurrencyInfo {
  mint: string;
  decimals: number;
}
export const tokens = [
  {
    name: "Solana",
    symbol: "SOL",
    mint: NATIVE_MINT,
    mint58: NATIVE_MINT.toBase58(),
    decimals: 9,
  },
  {
    name: "USDC",
    symbol: "USDC",
    mint: config.devnet ? new PublicKey(USDC_MINT_DEVNET) : new PublicKey(USDC_MINT),
    mint58: config.devnet ? USDC_MINT_DEVNET : USDC_MINT,
    decimals: 6,
  },
];

export const findTokenByName = (name: string) => {
  const token = tokens.find((token) => token.name.toLowerCase() === name.toLowerCase());
  if (!token) throw Error(`Unable to find token: ${name}.`);

  return token;
};

export const findTokenBySymbol = (symbol: string) => {
  const token = tokens.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase());
  if (!token) throw Error(`Unable to find token: ${symbol}.`);

  return token;
};

export const findTokenByMint = (mint: PublicKey | string) => {
  mint = typeof mint === "string" ? mint : mint.toBase58();

  const token = tokens.find((token) => token.mint58 === mint);
  if (!token) throw Error(`Unable to find token: ${mint}`);

  return token;
};

export const currencyMints: Record<string, CurrencyTypes> = config.devnet
  ? {
      [USDC_MINT_DEVNET]: USDC,
      [SOL_MINT_DEVNET]: SOL,
    }
  : {
      [USDC_MINT]: USDC,
      [SOL_MINT]: SOL,
    };

export const currencies: Record<CurrencyTypes, CurrencyInfo> = config.devnet
  ? {
      [USDC]: { mint: USDC_MINT_DEVNET, decimals: 6 },
      [SOL]: { mint: SOL_MINT_DEVNET, decimals: 9 },
    }
  : {
      [USDC]: { mint: USDC_MINT, decimals: 6 },
      [SOL]: { mint: SOL_MINT, decimals: 9 },
    };
