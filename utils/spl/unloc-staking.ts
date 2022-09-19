import { DEFAULT_PROGRAMS, UNLOC_STAKING_PID } from "@constants/config";
import { bignum } from "@metaplex-foundation/beet";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import {
  createCreateUserInstruction,
  createStakeInstruction,
  FarmPoolAccount,
  StateAccount,
} from "@unloc-dev/unloc-staking-solita";

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

export const getPoolUser = (farmPool: PublicKey, authority: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [farmPool.toBuffer(), authority.toBuffer()],
    UNLOC_STAKING_PID,
  )[0];
};

export const createUser = (wallet: PublicKey) => {
  const state = getStakingState(UNLOC_STAKING_PID);
  const pool = getPool(UNLOC_MINT, UNLOC_STAKING_PID);
  const user = getPoolUser(pool, wallet);
  const ix = createCreateUserInstruction(
    { authority: wallet, payer: wallet, state, pool, user, ...DEFAULT_PROGRAMS },
    UNLOC_STAKING_PID,
  );
  return ix;
};

export const createStake = async (
  connection: Connection,
  wallet: PublicKey,
  amount: bignum,
  lockDuration: bignum,
) => {
  const state = getStakingState(UNLOC_STAKING_PID);
  const extraRewardAccount = getExtraConfig(UNLOC_STAKING_PID);
  const pool = getPool(UNLOC_MINT, UNLOC_STAKING_PID);
  const user = getPoolUser(pool, wallet);
  const userVault = getAssociatedTokenAddressSync(UNLOC_MINT, wallet);

  const stateInfo = await StateAccount.fromAccountAddress(connection, state);
  const poolInfo = await FarmPoolAccount.fromAccountAddress(connection, pool);

  const ix = createStakeInstruction(
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
  );

  return ix;
};

export const stake = async (
  connection: Connection,
  wallet: PublicKey,
  amount: bignum,
  lockDuration: bignum,
) => {
  const instructions: TransactionInstruction[] = [];
  const pool = getPool(UNLOC_MINT, UNLOC_STAKING_PID);
  const user = getPoolUser(pool, wallet);
  const userInfo = connection.getAccountInfo(user);

  if (!userInfo) {
    instructions.push(createUser(wallet));
  }
  instructions.push(await createStake(connection, wallet, amount, lockDuration));

  return new Transaction().add(...instructions);
};
