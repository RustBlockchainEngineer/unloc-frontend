import { UNLOC_STAKING_PID } from "@constants/config";
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
  PoolInfo,
  //PROGRAM_ID,
  RelockOption,
  StakingAccounts,
  WithdrawOption,
} from "@unloc-dev/unloc-sdk-staking";
import { val } from "@utils/bignum";
import BN from "bn.js";
import dayjs from "dayjs";

///////////////
// CONSTANTS //
///////////////
export const STAKING_PID = UNLOC_STAKING_PID;
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
export const getUserScoreKey = (
  userWallet: PublicKey,
  poolKey: PublicKey = getStakingPoolKey(),
  programId: PublicKey = STAKING_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [UNLOC_STAKING, UNLOC_SCORE, userWallet.toBuffer(), poolKey.toBuffer(), DATA_ACCOUNT],
    programId,
  )[0];
};
/////////////////////////
// Instruction helpers //
/////////////////////////
export const createStakingUserOptionally = async (
  connection: Connection,
  userWallet: PublicKey,
  programId = STAKING_PID,
) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const userStakingsInfo = getUserStakingsKey(userWallet, programId);

  const instructions: TransactionInstruction[] = [];
  const check = await isAccountInitialized(connection, userStakingsInfo);
  if (!check) {
    // If the user account does not exist, initialize it
    instructions.push(
      createCreateUserInstruction(
        {
          stakingPoolInfo,
          userWallet,
          userStakingsInfo,
        },
        programId,
      ),
    );
  }

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
  const poolData = await PoolInfo.fromAccountAddress(connection, stakingPoolInfo);
  const userStakingsInfo = getUserStakingsKey(userWallet, programId);
  const userTokenAccountToDebit = getAssociatedTokenAddressSync(poolData.tokenMint, userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createStakeTokensInstruction(
      {
        userWallet,
        stakingPoolInfo,
        userStakingsInfo,
        userTokenAccountToDebit,
        stakingVault: poolData.stakingVault,
        tokenMint: poolData.tokenMint,
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
  const poolData = await PoolInfo.fromAccountAddress(connection, stakingPoolInfo);
  const userStakingsInfo = getUserStakingsKey(userWallet, programId);
  const userTokenAccountToCredit = getAssociatedTokenAddressSync(poolData.tokenMint, userWallet);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createUnstakeTokensInstruction(
      {
        userWallet,
        stakingPoolInfo,
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
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};

export const reallocUserAccount = async (userWallet: PublicKey, programId = STAKING_PID) => {
  const stakingPoolInfo = getStakingPoolKey(programId);
  const userStakingsInfo = getUserStakingsKey(userWallet, programId);
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
  const userStakingsInfo = getUserStakingsKey(userWallet, programId);
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
  const stakingPoolInfo = getStakingPoolKey();
  const userStakingsInfo = getUserStakingsKey(userWallet);
  const instructions: TransactionInstruction[] = [];
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

/////////////////////
// Other utilities //
/////////////////////
export const lockDurationEnumToSeconds = (duration: AllowedStakingDurationMonths) => {
  switch (duration) {
    case AllowedStakingDurationMonths.Zero:
      return 0;
    case AllowedStakingDurationMonths.One:
      return dayjs.duration(1, "month").asSeconds();
    case AllowedStakingDurationMonths.Two:
      return dayjs.duration(2, "month").asSeconds();
    case AllowedStakingDurationMonths.Three:
      return dayjs.duration(3, "month").asSeconds();
    case AllowedStakingDurationMonths.Six:
      return dayjs.duration(6, "month").asSeconds();
    case AllowedStakingDurationMonths.Twelve:
      return dayjs.duration(12, "month").asSeconds();
    case AllowedStakingDurationMonths.TwentyFour:
      return dayjs.duration(24, "month").asSeconds();
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
