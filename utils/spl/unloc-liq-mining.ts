import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createAllocateLiqMinRwdsInstruction,
  createClaimUserRewardsInstruction,
  PROGRAM_ID,
} from "@unloc-dev/unloc-sdk-liquidity-mining";
import { PoolInfo } from "@unloc-dev/unloc-sdk-staking";
import { getStakingPoolKey, getUserStakingsKey, STAKING_PID } from "./unloc-staking";
import { getProjectEmissionsKey, getVotingSessionKey, VOTING_PID } from "./unloc-voting";

///////////////
// CONSTANTS //
///////////////
export const LIQ_MINING_PID: PublicKey = PROGRAM_ID;
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111",
);

export const UNLOC_VOTING = Buffer.from("unloc-voting");
export const UNLOC_LIQ_MIN_RWDS = Buffer.from("unloc-liq-min-rwds");
export const VOTING_SESSION = Buffer.from("voting-session-info");
export const PROJECT_INFO = Buffer.from("project-info");
export const USER_STAKE_INFO = Buffer.from("user-stake-info");
export const UNLOC_SCORE = Buffer.from("unloc-score");
export const STAKING_POOL = Buffer.from("staking-pool");
export const DATA_ACCOUNT = Buffer.from("data-account");
export const TOKEN_ACCOUNT = Buffer.from("token-account");
export const LIQ_MIN_RWDS_VAULT = Buffer.from("liq-min-rwds-vault");
export const LIQ_MIN_COLLECTION_POOL_VAULT = Buffer.from("liq-min-collection-pool-vault");
export const PROJECT_EMISSIONS = Buffer.from("project-emissions-info");
export const UNLOC_STAKING = Buffer.from("unloc-staking");
export const MINING_POOL = Buffer.from("mining-pool");
/////////////////
// PDA helpers //
/////////////////
export const getCollectionPoolInfoKey = (
  collectionNft: PublicKey,
  programId: PublicKey = LIQ_MINING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_LIQ_MIN_RWDS, MINING_POOL, collectionNft.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};
export const getPoolRwdsVaultKey = (
  collectionNft: PublicKey,
  programId: PublicKey = LIQ_MINING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_LIQ_MIN_RWDS, LIQ_MIN_COLLECTION_POOL_VAULT, collectionNft.toBuffer(), TOKEN_ACCOUNT],
    programId,
  )[0];
};
// need to be implemented
export const getUserPoolRewardsInfo = (programId: PublicKey = LIQ_MINING_PID) => {
  return PublicKey.default;
};
/////////////////////////
// Instruction helpers //
/////////////////////////

export const claimRewards = async (
  connection: Connection,
  userWallet: PublicKey,
  collectionNft: PublicKey,
  stakingProgramId = STAKING_PID,
  programId = LIQ_MINING_PID,
) => {
  const poolRwdsVault = getPoolRwdsVaultKey(collectionNft, programId);
  const collectionPoolInfo = getCollectionPoolInfoKey(collectionNft, programId);

  const stakingPoolInfo = getStakingPoolKey(stakingProgramId);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingProgramId);
  const poolData = await PoolInfo.fromAccountAddress(connection, stakingPoolInfo);
  const stakingVault = getAssociatedTokenAddressSync(poolData.tokenMint, userWallet);
  const userPoolRewardsInfo = getUserPoolRewardsInfo();

  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createClaimUserRewardsInstruction({
      userWallet,
      collectionNft,
      collectionPoolInfo,
      userPoolRewardsInfo,
      poolRwdsVault,
      instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
      stakingProgram: stakingProgramId,
      stakingPoolInfo,
      userStakingsInfo,
      stakingVault,
      tokenMint: poolData.tokenMint,
    }),
  );

  return new Transaction().add(...instructions);
};
