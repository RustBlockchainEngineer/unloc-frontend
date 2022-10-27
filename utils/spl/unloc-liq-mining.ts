import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  Connection,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createClaimUserRewardsInstruction,
  PROGRAM_ID,
} from "@unloc-dev/unloc-sdk-liquidity-mining";
import { SubOffer } from "@unloc-dev/unloc-sdk-loan";
import { StakingPoolInfo } from "@unloc-dev/unloc-sdk-staking";

import { getNftMetadataKey } from "./common";
import { DATA_ACCOUNT, TOKEN_ACCOUNT, UNLOC } from "./unloc-constants";
import { getStakingPoolKey, getUserStakingsKey, STAKING_PID } from "./unloc-staking";
import { VOTING_PID } from "./unloc-voting";

/// ////////////
// CONSTANTS //
/// ////////////
export const LIQ_MINING_PID: PublicKey = PROGRAM_ID;

export const LIQ_MIN_RWDS_PROGRAM = Buffer.from("liqMinRwdsProgram");
export const COLLECTION_POOL_LOAN_REWARDS_INFO = Buffer.from("collectionPoolLoanRewardsInfo");
export const COLLECTION_POOL_REWARDS_VAULT = Buffer.from("collectionPoolRewardsVault");
export const LOAN_SUBOFFER_REWARDS_INFO = Buffer.from("loanSubofferRewardsInfo");

/// //////////////
// PDA helpers //
/// //////////////

export const getCollectionPoolRewardsInfoKey = (
  collectionNft: PublicKey,
  programId: PublicKey = VOTING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [
      UNLOC,
      LIQ_MIN_RWDS_PROGRAM,
      COLLECTION_POOL_LOAN_REWARDS_INFO,
      collectionNft.toBuffer(),
      DATA_ACCOUNT,
    ],
    programId,
  )[0];
};
export const getPoolRewardsVaultKey = (
  collectionNft: PublicKey,
  programId: PublicKey = LIQ_MINING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [
      UNLOC,
      LIQ_MIN_RWDS_PROGRAM,
      COLLECTION_POOL_REWARDS_VAULT,
      collectionNft.toBuffer(),
      TOKEN_ACCOUNT,
    ],
    programId,
  )[0];
};
export const getLoanSubofferRewardsInfoKey = (
  subOffer: PublicKey,
  programId: PublicKey = LIQ_MINING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, LIQ_MIN_RWDS_PROGRAM, LOAN_SUBOFFER_REWARDS_INFO, subOffer.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};
/// //////////////////////
// Instruction helpers //
/// //////////////////////
export const claimUserRewards = async (
  connection: Connection,
  userWallet: PublicKey,
  subOffer: PublicKey,
  programId = LIQ_MINING_PID,
  stakingProgram = STAKING_PID,
) => {
  const instructions: TransactionInstruction[] = [];
  const subOfferData = await SubOffer.fromAccountAddress(connection, subOffer);
  const nftMetadata = getNftMetadataKey(subOfferData.nftMint);
  const metadata = await Metadata.fromAccountAddress(connection, nftMetadata);
  const collectionNft = metadata.collection!.key;
  const collectionPoolRewardsInfo = getCollectionPoolRewardsInfoKey(collectionNft, programId);
  const collectionPoolRewardsVault = getPoolRewardsVaultKey(collectionNft, programId);
  const loanSubofferRewardsInfo = getLoanSubofferRewardsInfoKey(subOffer, programId);
  const stakingPoolInfo = getStakingPoolKey(stakingProgram);
  const stakingPoolData = await StakingPoolInfo.fromAccountAddress(connection, stakingPoolInfo);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, stakingProgram);
  const stakingDepositsVault = stakingPoolData.stakingDepositsVault;
  const unlocTokenMint = stakingPoolData.unlocTokenMint;
  instructions.push(
    createClaimUserRewardsInstruction(
      {
        userWallet,
        collectionNft,
        collectionPoolRewardsInfo,
        loanSubofferRewardsInfo,
        collectionPoolRewardsVault,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
        stakingProgram,
        stakingPoolInfo,
        userStakingsInfo,
        stakingDepositsVault,
        unlocTokenMint,
      },
      programId,
    ),
  );

  return new Transaction().add(...instructions);
};
