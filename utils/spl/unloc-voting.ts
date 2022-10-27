import {
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createVoteCollectionsInstruction,
  PROGRAM_ADDRESS,
  VoteChoice,
} from "@unloc-dev/unloc-sdk-voting";

import {
  getStakingPoolKey,
  getUserScoreKey,
  getUserStakingsKey,
  STAKING_PID,
} from "./unloc-staking";

/// ////////////
// CONSTANTS //
/// ////////////
export const VOTING_PID: PublicKey = new PublicKey(PROGRAM_ADDRESS);
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111",
);
export const METAPLEX_PID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const UNLOC = Buffer.from("unloc");
const DATA_ACCOUNT = Buffer.from("dataAccount");
// const TOKEN_ACCOUNT = Buffer.from("tokenAccount");
const VOTING_PROGRAM = Buffer.from("votingProgram");
const VOTE_SESSION_INFO = Buffer.from("voteSessionInfo");
const USER_VOTE_CHOICES_INFO = Buffer.from("userVoteChoicesInfo");
// const SESSION_TOTAL_EMISSIONS_VAULT = Buffer.from("sessionTotalEmissionsVault");

/// //////////////
// PDA helpers //
/// //////////////
export const getVotingSession = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, VOTING_PROGRAM, VOTE_SESSION_INFO, DATA_ACCOUNT],
    programId,
  )[0];
};
export const getUserVoteChoices = (
  wallet: PublicKey,
  voteSesssionInfo: PublicKey,
  programId = VOTING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [
      UNLOC,
      VOTING_PROGRAM,
      USER_VOTE_CHOICES_INFO,
      wallet.toBuffer(),
      voteSesssionInfo.toBuffer(),
      DATA_ACCOUNT,
    ],
    programId,
  )[0];
};
export const getVotingProgramDataKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [programId.toBytes()],
    BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  )[0];
};

export const getNftMetadataKey = (nftMint: PublicKey): PublicKey => {
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
): Promise<Transaction> => {
  const stakingPoolInfo = getStakingPoolKey(stakingProgram);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, stakingProgram);
  const unlocScoreInfo = getUserScoreKey(userWallet, stakingPoolInfo, stakingProgram);
  const voteSessionInfo = getVotingSession(programId);
  const userVoteChoicesInfo = getUserVoteChoices(userWallet, voteSessionInfo, programId);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createVoteCollectionsInstruction(
      {
        userWallet,
        stakingProgram,
        stakingPoolInfo,
        userStakingsInfo,
        unlocScoreInfo,
        voteSessionInfo,
        userVoteChoicesInfo,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
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
