import { bignum } from "@metaplex-foundation/beet";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import {
  AllowedStakingDurationMonths,
  createCreateUserInstruction,
  createIncreaseUserStorageInstruction,
  createMergeAccountsInstruction,
  createRelockAccountInstruction,
  createStakeTokensInstruction,
  createUnstakeTokensInstruction,
  PoolInfo,
  PROGRAM_ADDRESS,
  RelockOption,
  WithdrawOption,
} from "@unloc-dev/unloc-sdk-staking";

///////////////
// CONSTANTS //
///////////////
export const STAKING_PID: PublicKey = new PublicKey(PROGRAM_ADDRESS);
export const UNLOC_STAKING = Buffer.from("unloc-staking");
export const LOCKED_TOKENS = Buffer.from("locked-tokens");
export const USER_STAKE_INFO = Buffer.from("user-stake-info");
export const FLEXI = Buffer.from("always-unlocked");
export const LIQUIDITY_MINING = Buffer.from("2-months-lock");
export const UNLOC_SCORE = Buffer.from("unloc-score");
export const STAKING_POOL = Buffer.from("staking-pool");
export const DATA_ACCOUNT = Buffer.from("data-account");
export const STAKING_VAULT = Buffer.from("staking-vault");
export const REWARDS_VAULT = Buffer.from("rewards-vault");
export const TOKEN_ACCOUNT = Buffer.from("token-account");
export const PENALITY_DEPOSIT_VAULT = Buffer.from("penality-deposit-vault");
export const POOL_UPDATE_CONFIGS = Buffer.from("pool-update-configs");

/////////////////
// PDA helpers //
/////////////////
export const getStakingPoolKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, STAKING_POOL, DATA_ACCOUNT],
    programId,
  )[0];
};
export const getUserStakingsKey = (
  userWallet: PublicKey,
  poolKey: PublicKey = getStakingPoolKey(),
  programId: PublicKey = STAKING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, USER_STAKE_INFO, userWallet.toBuffer(), poolKey.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};
/////////////////////////
// Instruction helpers //
/////////////////////////
export const createStakingUser = async (userWallet: PublicKey) => {
  const poolInfo = getStakingPoolKey();
  const userStakingsInfo = getUserStakingsKey(userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createCreateUserInstruction({
      poolInfo,
      userWallet,
      userStakingsInfo,
    }),
  );

  return new Transaction().add(...instructions);
};
export const depositTokens = async (
  connection: Connection,
  userWallet: PublicKey,
  amount: bignum,
  lockDuration: AllowedStakingDurationMonths,
) => {
  const poolInfo = getStakingPoolKey();
  const poolData = await PoolInfo.fromAccountAddress(connection, poolInfo);
  const userStakingsInfo = getUserStakingsKey(userWallet);
  const userTokenAccountToDebit = getAssociatedTokenAddressSync(poolData.tokenMint, userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createStakeTokensInstruction(
      {
        userWallet,
        poolInfo,
        userStakingsInfo,
        userTokenAccountToDebit,
        stakingVault: poolData.stakingVault,
        tokenMint: poolData.tokenMint,
      },
      {
        amount,
        lockDuration,
      },
    ),
  );

  return new Transaction().add(...instructions);
};

export const withdrawTokens = async (
  connection: Connection,
  userWallet: PublicKey,
  withdrawOption: WithdrawOption,
) => {
  const poolInfo = getStakingPoolKey();
  const poolData = await PoolInfo.fromAccountAddress(connection, poolInfo);
  const userStakingsInfo = getUserStakingsKey(userWallet);
  const userTokenAccountToCredit = getAssociatedTokenAddressSync(poolData.tokenMint, userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createUnstakeTokensInstruction(
      {
        userWallet,
        poolInfo,
        userStakingsInfo,
        userTokenAccountToCredit,
        stakingVault: poolData.stakingVault,
        rewardsVault: poolData.rewardsVault,
        tokenMint: poolData.tokenMint,
        penalityDepositVault: poolData.penalityDepositVault,
      },
      {
        withdrawOption,
      },
    ),
  );
  return new Transaction().add(...instructions);
};

export const reallocUserAccount = async (userWallet: PublicKey) => {
  const poolInfo = getStakingPoolKey();
  const userStakingsInfo = getUserStakingsKey(userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createIncreaseUserStorageInstruction({
      userWallet,
      poolInfo,
      userStakingsInfo,
    }),
  );
  return new Transaction().add(...instructions);
};

export const relockStakingAccount = async (
  userWallet: PublicKey,
  relockOption: RelockOption,
  lockDuration: AllowedStakingDurationMonths,
) => {
  const poolInfo = getStakingPoolKey();
  const userStakingsInfo = getUserStakingsKey(userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createRelockAccountInstruction(
      {
        userWallet,
        poolInfo,
        userStakingsInfo,
      },
      {
        relockOption,
        lockDuration,
      },
    ),
  );
  return new Transaction().add(...instructions);
};
export const mergeStakingAccounts = async (
  userWallet: PublicKey,
  index1: number,
  index2: number,
  lockDuration: AllowedStakingDurationMonths,
) => {
  const poolInfo = getStakingPoolKey();
  const userStakingsInfo = getUserStakingsKey(userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createMergeAccountsInstruction(
      {
        userWallet,
        poolInfo,
        userStakingsInfo,
      },
      {
        index1,
        index2,
        lockDuration,
      },
    ),
  );
  return new Transaction().add(...instructions);
};
