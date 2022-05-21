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

type CurrencyInfo = {
  mint: string;
  decimals: number;
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
