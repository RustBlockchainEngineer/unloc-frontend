import { PublicKey } from "@solana/web3.js";

export const config = {
  devnet: true,
  devnetEndpoint: "https://api.devnet.solana.com",
  mainnetEndpoint: "https://solana-api.projectserum.com",
  //TODO: properties below is never used. I think we should remove them

  // pagiPrev: 2,
  // pagiNext: 2,
  // nftBulkMax: 20,
  // loanValueMin: 1,
  // loanAprMin: 1,
  // loanMinRepayMin: 1,
};

export const NFT_LOAN_PID = new PublicKey(
  config.devnet
    ? "4djDBtHEvzZqMTvpdxskmfegKmfMiPRHPnJ7yrXdCCaB"
    : "H87mP39hQqZvh3GESPCAV426Gp3vJcraz1YgtU21i5RV",
);

export const RPC_ENDPOINT = config.devnet ? config.devnetEndpoint : config.mainnetEndpoint;
