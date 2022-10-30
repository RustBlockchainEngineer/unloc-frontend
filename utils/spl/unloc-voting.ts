import {
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createVoteCollectionsInstruction,
  PROGRAM_ID,
  VoteChoice,
} from "@unloc-dev/unloc-sdk-voting";

import {
  BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  DATA_ACCOUNT,
  TOKEN_ACCOUNT,
  UNLOC,
} from "./unloc-constants";
import {
  getStakingPoolKey,
  getUserScoreKey,
  getUserStakingsKey,
  STAKING_PID,
} from "./unloc-staking";

/// ////////////
// CONSTANTS //
/// ////////////
export const VOTING_PID: PublicKey = PROGRAM_ID;
export const METAPLEX_PID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const VOTING_PROGRAM = Buffer.from("votingProgram");
export const VOTE_SESSION_INFO = Buffer.from("voteSessionInfo");
export const USER_VOTE_CHOICES_INFO = Buffer.from("userVoteChoicesInfo");
export const SESSION_TOTAL_EMISSIONS_VAULT = Buffer.from("sessionTotalEmissionsVault");
/// //////////////
// PDA helpers //
/// //////////////
export const getVotingSessionKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, VOTING_PROGRAM, VOTE_SESSION_INFO, DATA_ACCOUNT],
    programId,
  )[0];
};
export const getVotingProgramDataKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [programId.toBytes()],
    BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  )[0];
};
export const getNextEmissionsRewardsVaultKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, VOTING_PROGRAM, SESSION_TOTAL_EMISSIONS_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getUserVoteChoicesInfoKey = (
  userWallet: PublicKey,
  voteSessionInfo: PublicKey,
  programId: PublicKey = VOTING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [
      UNLOC,
      VOTING_PROGRAM,
      USER_VOTE_CHOICES_INFO,
      userWallet.toBuffer(),
      voteSessionInfo.toBuffer(),
      DATA_ACCOUNT,
    ],
    programId,
  )[0];
};
export const getNftMetadataKey = (nftMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METAPLEX_PID.toBuffer(), nftMint.toBuffer()],
    METAPLEX_PID,
  )[0];
};
/// //////////////////////
// Instruction helpers //
/// //////////////////////
export const voteCollections = async (
  userWallet: PublicKey,
  votingChoices: VoteChoice[] = [],
  stakingProgram: PublicKey = STAKING_PID,
  programId: PublicKey = VOTING_PID,
) => {
  const voteSessionInfo = getVotingSessionKey(programId);
  const stakingPoolInfo = getStakingPoolKey(stakingProgram);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, stakingProgram);
  const unlocScoreInfo = getUserScoreKey(userWallet, stakingPoolInfo, stakingProgram);
  const userVoteChoicesInfo = getUserVoteChoicesInfoKey(userWallet, voteSessionInfo, programId);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createVoteCollectionsInstruction(
      {
        userWallet,
        voteSessionInfo,
        unlocScoreInfo,
        stakingPoolInfo,
        stakingProgram,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
        userStakingsInfo,
        userVoteChoicesInfo,
      },
      {
        args: {
          votingChoices,
        },
      },
      programId,
    ),
  );

  return new Transaction().add(...instructions);
};
