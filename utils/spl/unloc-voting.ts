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
import { getStakingPoolKey, getUserScoreKey, STAKING_PID } from "./unloc-staking";

///////////////
// CONSTANTS //
///////////////
export const VOTING_PID: PublicKey = new PublicKey(PROGRAM_ADDRESS);
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111",
);
export const METAPLEX_PID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

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
export const PROJECT_EMISSIONS = Buffer.from("project-emissions-info");
export const UNLOC_STAKING = Buffer.from("unloc-staking");

/////////////////
// PDA helpers //
/////////////////
export const getVotingSessionKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_VOTING, VOTING_SESSION, DATA_ACCOUNT],
    programId,
  )[0];
};
export const getVotingProgramDataKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [programId.toBytes()],
    BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  )[0];
};
export const getLiqMinRwdsVaultKey = (programId: PublicKey = VOTING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_LIQ_MIN_RWDS, LIQ_MIN_RWDS_VAULT, TOKEN_ACCOUNT],
    programId,
  )[0];
};
export const getProjectEmissionsKey = (
  collectionNft: PublicKey,
  programId: PublicKey = VOTING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_VOTING, PROJECT_EMISSIONS, collectionNft.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};
export const getNftMetadataKey = (nftMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METAPLEX_PID.toBuffer(), nftMint.toBuffer()],
    METAPLEX_PID,
  )[0];
};
/////////////////////////
// Instruction helpers //
/////////////////////////
export const voteCollections = async (userWallet: PublicKey, choices: VoteChoice[] = []) => {
  const voteSessionInfo = getVotingSessionKey();
  const poolInfo = getStakingPoolKey();
  const userScoreInfo = getUserScoreKey(userWallet, poolInfo);
  const stakingProgram = STAKING_PID;
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createVoteCollectionsInstruction(
      {
        userWallet,
        voteSessionInfo,
        userScoreInfo,
        poolInfo,
        stakingProgram,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        args: {
          choices,
        },
      },
    ),
  );

  return new Transaction().add(...instructions);
};
