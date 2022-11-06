import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

export const config = {
  devnet: true,
  devnetEndpoint: "https://api.devnet.solana.com",
  mainnetEndpoint: "https://solana-api.projectserum.com",
};

export const NFT_LOAN_PID = new PublicKey(
  config.devnet
    ? "Lon8EEkzGASmotFtJBanbTkzhsUc5fvCb4wtDxqrhhq"
    : "H87mP39hQqZvh3GESPCAV426Gp3vJcraz1YgtU21i5RV",
);

export const UNLOC_STAKING_PID = new PublicKey("Stkmjz1k2Ak9sj57reGuei8jY28r2eRFRmB49mTN7u8");
export const UNLOC_VOTING_PID = new PublicKey("Voti8b8TVbqgS5TQ5oiDU3eHNqAjsZQuuMUKe4JwufU");

export const RPC_ENDPOINT = config.devnet ? config.devnetEndpoint : config.mainnetEndpoint;

export const formatOptions: Intl.NumberFormatOptions = {
  maximumFractionDigits: 4,
  minimumFractionDigits: 2,
  useGrouping: false,
};

// Token Metadata program
export const METADATA = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Commonly used programs
export const DEFAULT_PROGRAMS = {
  metadataProgram: METADATA,
  clock: SYSVAR_CLOCK_PUBKEY,
  rent: SYSVAR_RENT_PUBKEY,
  tokenProgram: TOKEN_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
};

// Chainlink programs
const CHAINLINK_STORE_PROGRAM = new PublicKey("HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny");
export const CHAINLINK_SOL_FEED = new PublicKey("HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6");
export const CHAINLINK_USDC_FEED = new PublicKey("4NmRgDfAZrfBHQBuzstMP5Bu1pgBzVn8u1djSvNrNkrN");
export const CHAINLINK_PROGRAMS = {
  chainlinkProgram: CHAINLINK_STORE_PROGRAM,
  solFeed: CHAINLINK_SOL_FEED,
  usdcFeed: CHAINLINK_USDC_FEED,
};

/// /////////////////////////
// Loan Program Constants //
/// /////////////////////////
export const GLOBAL_STATE_TAG = Buffer.from("GLOBAL_STATE_SEED");
export const REWARD_VAULT_TAG = Buffer.from("REWARD_VAULT_SEED");
export const OFFER_TAG = Buffer.from("OFFER_SEED");
export const SUB_OFFER_TAG = Buffer.from("SUB_OFFER_SEED");
export const NFT_VAULT_TAG = Buffer.from("NFT_VAULT_SEED");
export const OFFER_VAULT_TAG = Buffer.from("OFFER_VAULT_SEED");
export const TREASURY_VAULT_TAG = Buffer.from("TREASURY_VAULT_SEED");
