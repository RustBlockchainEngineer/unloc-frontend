import { DEFAULT_PROGRAMS, UNLOC_STAKING_PID } from "@constants/config";
import { bignum } from "@metaplex-foundation/beet";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createCreateUserInstruction,
  createStakeInstruction,
  createUnstakeInstruction,
  createHarvestInstruction,
  FarmPoolAccount,
  FarmPoolUserAccount,
  StateAccount,
} from "@unloc-dev/unloc-staking-solita";
import { BN } from "bn.js";
import { isAccountInitialized } from "./unloc-loan";

// CONSTANTS
export const STATE_SEED = Buffer.from("state");
export const EXTRA_SEED = Buffer.from("extra");
export const UNLOC_MINT = new PublicKey("Bt8KVz26uLrXrMzRKaJgX9rYd2VcfBh8J67D4s3kRmut");

// PDAs
export const getStakingState = (programId: PublicKey) => {
  return PublicKey.findProgramAddressSync([STATE_SEED], programId)[0];
};

export const getExtraConfig = (programId: PublicKey) => {
  return PublicKey.findProgramAddressSync([EXTRA_SEED], programId)[0];
};

export const getPool = (mint: PublicKey, programId: PublicKey) => {
  return PublicKey.findProgramAddressSync([mint.toBuffer()], programId)[0];
};

export const getPoolUser = (farmPool: PublicKey, authority: PublicKey, stakeSeed: number) => {
  return PublicKey.findProgramAddressSync(
    [farmPool.toBuffer(), authority.toBuffer(), new BN(stakeSeed).toArrayLike(Buffer, "le", 1)],
    UNLOC_STAKING_PID,
  )[0];
};

export const createUser = (wallet: PublicKey, stakeSeed: number) => {
  const state = getStakingState(UNLOC_STAKING_PID);
  const pool = getPool(UNLOC_MINT, UNLOC_STAKING_PID);
  const user = getPoolUser(pool, wallet, stakeSeed);
  const ix = createCreateUserInstruction(
    { authority: wallet, payer: wallet, state, pool, user, ...DEFAULT_PROGRAMS },
    { stakeSeed },
    UNLOC_STAKING_PID,
  );
  return ix;
};

export const createStake = async (
  connection: Connection,
  wallet: PublicKey,
  stakeSeed: number,
  amount: bignum,
  lockDuration: bignum,
) => {
  const instructions: TransactionInstruction[] = [];
  const state = getStakingState(UNLOC_STAKING_PID);
  const extraRewardAccount = getExtraConfig(UNLOC_STAKING_PID);
  const pool = getPool(UNLOC_MINT, UNLOC_STAKING_PID);
  const user = getPoolUser(pool, wallet, stakeSeed);
  const userVault = getAssociatedTokenAddressSync(UNLOC_MINT, wallet);

  const stateInfo = await StateAccount.fromAccountAddress(connection, state);
  const poolInfo = await FarmPoolAccount.fromAccountAddress(connection, pool);
  const userInfo = await connection.getAccountInfo(user);
  if (!userInfo) {
    instructions.push(createUser(wallet, stakeSeed));
  }

  instructions.push(
    createStakeInstruction(
      {
        authority: wallet,
        state,
        pool,
        user,
        mint: UNLOC_MINT,
        extraRewardAccount,
        feeVault: stateInfo.feeVault,
        poolVault: poolInfo.vault,
        userVault,
        ...DEFAULT_PROGRAMS,
      },
      { amount, lockDuration },
      UNLOC_STAKING_PID,
    ),
  );

  return new Transaction().add(...instructions);
};

export const unstake = async (
  connection: Connection,
  wallet: PublicKey,
  amount: bignum,
  farmPoolUser: PublicKey,
) => {
  const state = getStakingState(UNLOC_STAKING_PID);
  const extraRewardAccount = getExtraConfig(UNLOC_STAKING_PID);
  const pool = getPool(UNLOC_MINT, UNLOC_STAKING_PID);
  const userVault = getAssociatedTokenAddressSync(UNLOC_MINT, wallet);

  const stateInfo = await StateAccount.fromAccountAddress(connection, state);
  const poolInfo = await FarmPoolAccount.fromAccountAddress(connection, pool);

  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createUnstakeInstruction(
      {
        authority: wallet,
        state,
        pool,
        user: farmPoolUser,
        mint: UNLOC_MINT,
        extraRewardAccount,
        feeVault: stateInfo.feeVault,
        poolVault: poolInfo.vault,
        userVault,
        ...DEFAULT_PROGRAMS,
      },
      {
        amount,
      },
      UNLOC_STAKING_PID,
    ),
  );

  return new Transaction().add(...instructions);
};

export const harvest = async (
  connection: Connection,
  wallet: PublicKey,
  farmPoolUser: PublicKey,
) => {
  const state = getStakingState(UNLOC_STAKING_PID);
  const extraRewardAccount = getExtraConfig(UNLOC_STAKING_PID);
  const pool = getPool(UNLOC_MINT, UNLOC_STAKING_PID);
  const userVault = getAssociatedTokenAddressSync(UNLOC_MINT, wallet);
  const stateInfo = await StateAccount.fromAccountAddress(connection, state);

  const instructions: TransactionInstruction[] = [];
  if (!(await isAccountInitialized(connection, userVault))) {
    instructions.push(
      createAssociatedTokenAccountInstruction(wallet, userVault, wallet, UNLOC_MINT),
    );
  }

  instructions.push(
    createHarvestInstruction(
      {
        authority: wallet,
        state,
        pool,
        user: farmPoolUser,
        mint: UNLOC_MINT,
        userVault,
        extraRewardAccount,
        rewardVault: stateInfo.rewardVault,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
      UNLOC_STAKING_PID,
    ),
  );

  return new Transaction().add(...instructions);
};

// Used for optimistic updates
export const getFarmPoolUserObject = (
  wallet: PublicKey,
  amount: bignum,
  stakeSeed: number,
  extraReward: number,
  lastStakeTime: number,
  lockDuration: number,
) => {
  return FarmPoolUserAccount.fromArgs({
    amount,
    authority: wallet,
    stakeSeed,
    extraReward,
    lastStakeTime,
    lockDuration,
    // everything below is ignored
    bump: 0,
    pool: PublicKey.default,
    profileLevel: 0,
    rewardAmount: 0,
    rewardDebt: 0,
    unlocScore: 0,
    reserved1: 0,
    reserved2: 0,
    reserved3: 0,
  });
};
