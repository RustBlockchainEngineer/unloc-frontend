import { PublicKey } from "@solana/web3.js";

export const config = {
  devnet: true,
  devnetEndpoint: "https://api.devnet.solana.com",
  mainnetEndpoint: "https://solana-api.projectserum.com",
};

export const NFT_LOAN_PID = new PublicKey(
  config.devnet
    ? "4djDBtHEvzZqMTvpdxskmfegKmfMiPRHPnJ7yrXdCCaB"
    : "H87mP39hQqZvh3GESPCAV426Gp3vJcraz1YgtU21i5RV",
);

export const RPC_ENDPOINT = config.devnet ? config.devnetEndpoint : config.mainnetEndpoint;

export const formatOptions: Intl.NumberFormatOptions = {
  maximumFractionDigits: 4,
  minimumFractionDigits: 2,
  useGrouping: false,
};
