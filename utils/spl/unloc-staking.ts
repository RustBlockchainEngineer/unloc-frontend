// eslint-disable-next-line import/named
import { bignum } from "@metaplex-foundation/beet";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  AllowedStakingDurationMonths,
  createCreateUserInstruction,
  createIncreaseUserStorageInstruction,
  createMergeAccountsInstruction,
  createRelockAccountInstruction,
  createStakeTokensInstruction,
  createUnstakeTokensInstruction,
  StakingPoolInfo,
  PROGRAM_ID,
  RelockOption,
  StakingAccounts,
  WithdrawOption,
  UserStakingsInfo,
  createRefreshUserUnlocScoreInstruction,
} from "@unloc-dev/unloc-sdk-staking";
import BN from "bn.js";
import dayjs from "dayjs";

import { val } from "@utils/bignum";

import { DATA_ACCOUNT, UNLOC } from "./unloc-constants";

/// ////////////
// CONSTANTS //
/// ////////////
export const STAKING_PID: PublicKey = PROGRAM_ID;
export const STAKING_PROGRAM = Buffer.from("stakingProgram");
export const STAKING_POOL_INFO = Buffer.from("stakingPoolInfo");
export const USER_STAKINGS_INFO = Buffer.from("userStakingsInfo");
export const USER_UNLOC_SCORE_INFO = Buffer.from("unlocScoreInfo");
export const POOL_UPDATE_CONFIGS_INFO = Buffer.from("poolUpdateConfigsInfo");

export const STAKING_REWARDS_VAULT = Buffer.from("stakingRewardsVault");
export const STAKING_DEPOSITS_VAULT = Buffer.from("stakingDepositsVault");
export const PENALITY_DEPOSIT_VAULT = Buffer.from("penalityDepositsVault");

export const MAX_ACTIVE_LOCKED_STAKING_ACCOUNTS = 500;
/// //////////////
// PDA helpers //
/// //////////////
export const getStakingPoolKey = (programId: PublicKey = STAKING_PID) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC, STAKING_PROGRAM, STAKING_POOL_INFO, DATA_ACCOUNT],
    programId,
  )[0];
};
export const getUserStakingsKey = (
  userWallet: PublicKey,
  poolKey: PublicKey = getStakingPoolKey(),
  programId: PublicKey = STAKING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [
      UNLOC,
      STAKING_PROGRAM,
      USER_STAKINGS_INFO,
      userWallet.toBuffer(),
      poolKey.toBuffer(),
      DATA_ACCOUNT,
    ],
    programId,
  )[0];
};

export const getUserScoreKey = (
  userWallet: PublicKey,
  poolKey: PublicKey = getStakingPoolKey(),
  programId: PublicKey = STAKING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [
      UNLOC,
      STAKING_PROGRAM,
      USER_UNLOC_SCORE_INFO,
      userWallet.toBuffer(),
      poolKey.toBuffer(),
      DATA_ACCOUNT,
    ],
    programId,
  )[0];
};
/// //////////////////////
// Instruction helpers //
/// //////////////////////
export const createStakingUserOptionally = async (
  connection: Connection,
  userWallet: PublicKey,
  programId = STAKING_PID,
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, programId);
  const unlocScoreInfo = getUserScoreKey(userWallet, stakingPoolInfo, programId);

  const instructions: TransactionInstruction[] = [];
  const check = await isAccountInitialized(connection, userStakingsInfo);
  if (!check)
    // If the user account does not exist, initialize it
    instructions.push(
      createCreateUserInstruction(
        {
          stakingPoolInfo,
          userWallet,
          userStakingsInfo,
          unlocScoreInfo,
        },
        programId,
      ),
    );

  return instructions;
};
export const depositTokens = async (
  connection: Connection,
  userWallet: PublicKey,
  amount: bignum,
  lockDuration: AllowedStakingDurationMonths,
  programId = STAKING_PID,
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const poolData = await StakingPoolInfo.fromAccountAddress(connection, stakingPoolInfo);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, programId);
  const userUnlocAtaToDebit = getAssociatedTokenAddressSync(poolData.unlocTokenMint, userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createStakeTokensInstruction(
      {
        userWallet,
        stakingPoolInfo,
        userStakingsInfo,
        userUnlocAtaToDebit,
        stakingDepositsVault: poolData.stakingDepositsVault,
        unlocTokenMint: poolData.unlocTokenMint,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      {
        amount,
        lockDuration,
      },
      programId,
    ),
  );

  return instructions;
};

export const withdrawTokens = async (
  connection: Connection,
  userWallet: PublicKey,
  withdrawOption: WithdrawOption,
  programId = STAKING_PID,
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const poolData = await StakingPoolInfo.fromAccountAddress(connection, stakingPoolInfo);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, programId);
  const userUnlocAtaToCredit = getAssociatedTokenAddressSync(poolData.unlocTokenMint, userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createUnstakeTokensInstruction(
      {
        userWallet,
        stakingPoolInfo,
        userStakingsInfo,
        userUnlocAtaToCredit,
        stakingDepositsVault: poolData.stakingDepositsVault,
        stakingRewardsVault: poolData.stakingRewardsVault,
        unlocTokenMint: poolData.unlocTokenMint,
        penalityDepositVault: poolData.penalityDepositVault,
      },
      {
        withdrawOption,
      },
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};
export const reallocUserAccountOptionally = (
  userWallet: PublicKey,
  userStakingInfo: UserStakingsInfo,
  programId = STAKING_PID,
) => {
  // CHECK if reallocation is necessary
  const instructions: TransactionInstruction[] = [];
  if (
    userStakingInfo &&
    userStakingInfo.stakingAccounts.locked.numActiveLockedStakingAccounts ===
      userStakingInfo.stakingAccounts.locked.currentMaxLockedStakingsPossible &&
    userStakingInfo.stakingAccounts.locked.currentMaxLockedStakingsPossible <
      MAX_ACTIVE_LOCKED_STAKING_ACCOUNTS
  ) {
    // Reallocation needed
    const ix = reallocUserAccount(userWallet, programId);
    instructions.push(...ix.instructions);
  }

  return instructions;
};
export const reallocUserAccount = (userWallet: PublicKey, programId = STAKING_PID) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, programId);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createIncreaseUserStorageInstruction(
      {
        userWallet,
        stakingPoolInfo,
        userStakingsInfo,
      },
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};

export const relockStakingAccount = async (
  userWallet: PublicKey,
  relockOption: RelockOption,
  lockDuration: AllowedStakingDurationMonths,
  programId = STAKING_PID,
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, programId);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createRelockAccountInstruction(
      {
        userWallet,
        stakingPoolInfo,
        userStakingsInfo,
      },
      {
        relockOption,
        lockDuration,
      },
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};

export const mergeStakingAccounts = async (
  userWallet: PublicKey,
  index1: number,
  indexes: number[],
  lockDuration: AllowedStakingDurationMonths,
  programId = STAKING_PID,
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, programId);
  const instructions: TransactionInstruction[] = [];
  // eslint-disable-next-line array-callback-return
  indexes.map((index2) => {
    instructions.push(
      createMergeAccountsInstruction(
        {
          userWallet,
          stakingPoolInfo,
          userStakingsInfo,
        },
        {
          index1,
          index2,
          lockDuration,
        },
        programId,
      ),
    );
  });
  return new Transaction().add(...instructions);
};

export const refreshUserScore = (userWallet: PublicKey, programId = STAKING_PID) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const userStakingsInfo = getUserStakingsKey(userWallet, stakingPoolInfo, programId);
  const unlocScoreInfo = getUserScoreKey(userWallet, stakingPoolInfo, programId);

  const ix = createRefreshUserUnlocScoreInstruction(
    {
      userWallet,
      stakingPoolInfo,
      userStakingsInfo,
      unlocScoreInfo,
    },
    programId,
  );
  return ix;
};

/// //////////////////
// Other utilities //
/// //////////////////
export const lockDurationEnumToSeconds = (duration: AllowedStakingDurationMonths) => {
  const dayjslib = dayjs as any;
  switch (duration) {
    case AllowedStakingDurationMonths.Zero:
      return 0;
    case AllowedStakingDurationMonths.One:
      return dayjslib.duration(1, "month").asSeconds();
    case AllowedStakingDurationMonths.Two:
      return dayjslib.duration(2, "month").asSeconds();
    case AllowedStakingDurationMonths.Three:
      return dayjslib.duration(3, "month").asSeconds();
    case AllowedStakingDurationMonths.Six:
      return dayjslib.duration(6, "month").asSeconds();
    case AllowedStakingDurationMonths.Twelve:
      return dayjslib.duration(12, "month").asSeconds();
    case AllowedStakingDurationMonths.TwentyFour:
      return dayjslib.duration(24, "month").asSeconds();
  }
};

export const convertDayDurationToEnum = (days: number) => {
  switch (days) {
    case 0:
      return AllowedStakingDurationMonths.Zero;
    case 30:
      return AllowedStakingDurationMonths.One;
    case 60:
      return AllowedStakingDurationMonths.Two;
    case 90:
      return AllowedStakingDurationMonths.Three;
    case 180:
      return AllowedStakingDurationMonths.Six;
    case 365:
      return AllowedStakingDurationMonths.Twelve;
    case 730:
      return AllowedStakingDurationMonths.TwentyFour;
    default:
      throw Error(`Invalid day duration: ${days}`);
  }
};

export const getTotalNumberOfStakingAccounts = (stakingInfo?: StakingAccounts) => {
  if (!stakingInfo) return 0;

  const locked = stakingInfo?.locked.numActiveLockedStakingAccounts;
  const flexi = val(stakingInfo.flexi.stakingData.initialTokensStaked).gtn(0) ? 1 : 0;
  const liqMin = val(stakingInfo.liqMinRwds.stakingData.initialTokensStaked).gtn(0) ? 1 : 0;
  return locked + flexi + liqMin;
};

export const getTotalStakedAmount = (stakingInfo?: StakingAccounts) => {
  if (!stakingInfo) return new BN(0);

  const totalLocked = stakingInfo.locked.lockedStakingsData.reduce<BN>((sum, lockedAcc) => {
    return lockedAcc.indexInUse ? sum.add(val(lockedAcc.stakingData.initialTokensStaked)) : sum;
  }, new BN(0));

  const flexi = stakingInfo.flexi.stakingData.initialTokensStaked;
  const liqMin = stakingInfo.liqMinRwds.stakingData.initialTokensStaked;
  return totalLocked.add(val(flexi)).add(val(liqMin));
};

export const getTotalClaimableAmount = (stakingInfo?: StakingAccounts) => {
  if (!stakingInfo) return new BN(0);
  const time = Math.round(Date.now() / 1000);

  // Regular locked staking accounts
  const totalLockedAvailable = stakingInfo.locked.lockedStakingsData.reduce<BN>(
    (sum, lockedAcc) => {
      if (lockedAcc.indexInUse) {
        const unlockTime = val(lockedAcc.stakingData.accountLastUpdatedAt).add(
          val(lockedAcc.stakingData.lockDuration),
        );

        return unlockTime.lten(time)
          ? sum.add(val(lockedAcc.stakingData.initialTokensStaked))
          : sum;
      }

      return sum;
    },
    new BN(0),
  );

  // Flexi is always claimable
  const flexi = val(stakingInfo.flexi.stakingData.initialTokensStaked);

  // Liquidity mining account
  const unlockTime = val(stakingInfo.liqMinRwds.stakingData.accountLastUpdatedAt).add(
    val(stakingInfo.liqMinRwds.stakingData.lockDuration),
  );
  const liqMin = unlockTime.lten(time)
    ? val(stakingInfo.liqMinRwds.stakingData.initialTokensStaked)
    : new BN(0);

  // Total
  return totalLockedAvailable.add(flexi).add(liqMin);
};

export const isAccountInitialized = async (connection: Connection, address: PublicKey) => {
  try {
    const result = await connection.getAccountInfo(address);
    return !!result && !!result.data;
  } catch (err) {
    return false;
  }
};
