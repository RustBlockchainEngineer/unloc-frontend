// eslint-disable-next-line import/named
import { bignum } from "@metaplex-foundation/beet";
import {
  AllowedStakingDurationMonths,
  CompoundingFrequency,
  LockedStakingsData,
  NumDenPair,
  PoolInfo,
  ScoreMultiplier,
  StakingData,
  UserStakingsInfo,
} from "@unloc-dev/unloc-sdk-staking";
import BN from "bn.js";
import { Decimal } from "decimal.js";

import { numVal, val } from "@utils/bignum";
import { getDurationForContractData } from "@utils/timeUtils/timeUtils";

import { convertDayDurationToEnum, lockDurationEnumToSeconds } from "./unloc-staking";

export const getUnlocScore = (poolInfo: PoolInfo, user: UserStakingsInfo): BN => {
  const { liqMinRwds, locked } = user.stakingAccounts;
  // Flexi always has a score of 0

  // Liquidity mining score contribution
  const scoreLiqMin = getUnlocScoreContribution(liqMinRwds.stakingData, poolInfo);

  // For locked accounts, we need to sum the score of each active staking
  const scoreLocked = locked.lockedStakingsData.reduce((sum, account) => {
    return account.isActive
      ? sum.add(getUnlocScoreContribution(account.stakingData, poolInfo))
      : sum;
  }, new BN(0));

  return scoreLiqMin.add(scoreLocked);
};

export const getUnlocScoreContribution = (stakingAccount: StakingData, poolInfo: PoolInfo): BN => {
  const { accountLastUpdatedAt, initialTokensStaked, lockDuration } = stakingAccount;

  const remainingLockDuration = remainingLockDurationSeconds(accountLastUpdatedAt, lockDuration);
  const scoreMultiplier = getScoreMultiplier(
    poolInfo.scoreMultiplier,
    lockDuration,
    remainingLockDuration,
  );
  const preciseScoreMultiplier = new Decimal(scoreMultiplier.numerator.toString()).dividedBy(
    scoreMultiplier.denominator.toString(),
  );

  const preciseInitialTokensStaked = new Decimal(initialTokensStaked.toString());

  return new BN(preciseInitialTokensStaked.mul(preciseScoreMultiplier).floor().toString());
};

export const getUnlocScoreContributionForLightbox = (
  initialTokensStaked: bignum,
  lockDurationInDays: number,
  poolInfo: PoolInfo,
): BN => {
  const durationEnum = convertDayDurationToEnum(lockDurationInDays);
  const lockDurationInSeconds = getDurationForContractData(lockDurationInDays, "days");

  const scoreMultiplier = getScoreMultiplier(
    poolInfo.scoreMultiplier,
    durationEnum,
    lockDurationInSeconds,
  );

  const preciseScoreMultiplier = new Decimal(scoreMultiplier.numerator.toString()).dividedBy(
    scoreMultiplier.denominator.toString(),
  );

  const preciseInitialTokensStaked = new Decimal(initialTokensStaked.toString());

  return new BN(preciseInitialTokensStaked.mul(preciseScoreMultiplier).toString());
};

export const getUserLevel = (
  poolInfo: PoolInfo,
  score: bignum,
): { level: number; feeReductionBasisPoints: number } => {
  const { level0, level1, level2, level3, level4, level5 } = poolInfo.profileLevelMultiplier;

  score = val(score);
  if (score.gte(val(level5.minUnlocScore)))
    return { level: 5, feeReductionBasisPoints: numVal(level5.feeReductionBasisPoints) };
  else if (score.gte(val(level4.minUnlocScore)))
    return { level: 4, feeReductionBasisPoints: numVal(level4.feeReductionBasisPoints) };
  else if (score.gte(val(level3.minUnlocScore)))
    return { level: 3, feeReductionBasisPoints: numVal(level3.feeReductionBasisPoints) };
  else if (score.gte(val(level2.minUnlocScore)))
    return { level: 2, feeReductionBasisPoints: numVal(level2.feeReductionBasisPoints) };
  else if (score.gte(val(level1.minUnlocScore)))
    return { level: 1, feeReductionBasisPoints: numVal(level1.feeReductionBasisPoints) };
  else return { level: 0, feeReductionBasisPoints: numVal(level0.feeReductionBasisPoints) };
};

const timeElapsedSeconds = (accountLastUpdatedAt: bignum): BN => {
  // TODO: Date.now() should be replaced with SYSVAR_CLOCK
  const now = Math.floor(Date.now() / 1000);
  return new BN(now).sub(val(accountLastUpdatedAt));
};

const remainingLockDurationSeconds = (
  accountLastUpdatedAt: bignum,
  lockDuration: AllowedStakingDurationMonths,
): number => {
  // Timestamps shouldn't overflow the number primitive, at least not any time soon
  const timeElapsed = timeElapsedSeconds(accountLastUpdatedAt).toNumber();
  const lockDurationSeconds = lockDurationEnumToSeconds(lockDuration);

  if (lockDurationSeconds > timeElapsed) return lockDurationSeconds - timeElapsed;

  return 0;
};

const getScoreMultiplier = (
  multipliers: ScoreMultiplier,
  initialLockDuration: AllowedStakingDurationMonths,
  remainingLockDuration: number,
): NumDenPair => {
  if (initialLockDuration === AllowedStakingDurationMonths.Zero) return multipliers.flexi;

  if (initialLockDuration === AllowedStakingDurationMonths.Two) return multipliers.liqMin;

  if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.Twelve))
    return multipliers.rldm2412;
  else if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.Six))
    return multipliers.rldm126;
  else if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.Three))
    return multipliers.rldm63;
  else if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.One))
    return multipliers.rldm31;
  else if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.Zero))
    return multipliers.rldm10;
  else return { numerator: 0, denominator: 1 };
};
export const getEarnedSoFar = (stakingData: StakingData, stakingPoolInfo: PoolInfo): BN => {
  return getTotalTokens(stakingData, stakingPoolInfo).sub(
    new BN(stakingData.initialTokensStaked.toString()),
  );
};

export const getAllEarnedSoFar = (
  stakingsData: LockedStakingsData,
  stakingPoolInfo: PoolInfo,
): BN => {
  let result = new BN(0);
  for (const lockedStakingAccount of stakingsData.lockedStakingsData)
    result = result.add(getEarnedSoFar(lockedStakingAccount.stakingData, stakingPoolInfo));

  return result;
};
export const getTotalTokens = (stakingData: StakingData, stakingPoolInfo: PoolInfo): BN => {
  let totalTokens = new BN(1);
  const timeElapsed = timeElapsedSeconds(stakingData.accountLastUpdatedAt).toNumber();
  const lockDurationSeconds = (stakingData.lockDuration as number) * 60 * 60 * 24 * 30;
  if (timeElapsed > lockDurationSeconds) {
    const flexiPeriod = timeElapsed - lockDurationSeconds;
    const flexiPeriodConverted = secondsToCFTime(
      stakingPoolInfo.interestRateFraction.compoundingFrequency,
      flexiPeriod,
    );
    const tokenMultiplier = Math.floor(
      getTokensMultiplier(
        stakingPoolInfo.interestRateFraction.flexi,
        flexiPeriodConverted,
      ).toNumber(),
    );
    totalTokens = new BN(1).add(totalTokens.mul(new BN(tokenMultiplier)));
  }
  totalTokens = getPartialTokensContribution(
    stakingData,
    stakingPoolInfo,
    totalTokens,
    1,
    1,
    stakingPoolInfo.interestRateFraction.rldm10,
  );
  totalTokens = getPartialTokensContribution(
    stakingData,
    stakingPoolInfo,
    totalTokens,
    3,
    2,
    stakingPoolInfo.interestRateFraction.rldm31,
  );
  totalTokens = getPartialTokensContribution(
    stakingData,
    stakingPoolInfo,
    totalTokens,
    6,
    3,
    stakingPoolInfo.interestRateFraction.rldm63,
  );
  totalTokens = getPartialTokensContribution(
    stakingData,
    stakingPoolInfo,
    totalTokens,
    12,
    6,
    stakingPoolInfo.interestRateFraction.rldm126,
  );
  totalTokens = getPartialTokensContribution(
    stakingData,
    stakingPoolInfo,
    totalTokens,
    24,
    12,
    stakingPoolInfo.interestRateFraction.rldm2412,
  );
  return totalTokens.mul(new BN(stakingData.initialTokensStaked.toString()));
};
const secondsToCFTime = (cf: CompoundingFrequency, numSeconds: number): number => {
  let convertedTime = 0;
  switch (cf) {
    case CompoundingFrequency.Secondly:
      convertedTime = numSeconds;
      break;
    case CompoundingFrequency.Minutely:
      convertedTime = numSeconds / 60;
      break;
    case CompoundingFrequency.Hourly:
      convertedTime = numSeconds / 3600;
      break;
    case CompoundingFrequency.Daily:
      convertedTime = numSeconds / 3600 / 24;
      break;
    case CompoundingFrequency.Monthly:
      convertedTime = numSeconds / 3600 / 24 / 30;
      break;
    default:
      convertedTime = 1;
      break;
  }
  if (convertedTime === 0) convertedTime = 1;

  return convertedTime;
};
const getTokensMultiplier = (numDenPair: NumDenPair, numCompundings: number): BN => {
  const preciseOne = new BN(1);
  const f1 = preciseOne.add(new BN(numDenPair.numerator).div(new BN(numDenPair.denominator)));
  return new BN(f1).pow(new BN(numCompundings));
};
const getPartialTokensContribution = (
  stakingData: StakingData,
  stakingPoolInfo: PoolInfo,
  totalTokens: BN,
  levelMonths: number,
  stepPeriodMnths: number,
  interestFraction: NumDenPair,
): BN => {
  const timeElapsed = timeElapsedSeconds(stakingData.accountLastUpdatedAt).toNumber();
  const lockDurationSeconds = (stakingData.lockDuration as number) * 60 * 60 * 24 * 30;
  const lockDurationMonths = lockDurationToMonths(stakingData.lockDuration);
  if (
    lockDurationMonths > levelMonths &&
    timeElapsed > lockDurationSeconds - levelMonths * 60 * 60 * 24 * 30
  ) {
    const minTimeConverted = secondsToCFTime(
      stakingPoolInfo.interestRateFraction.compoundingFrequency,
      Math.min(stepPeriodMnths * 60 * 60 * 24 * 30, timeElapsed),
    );
    const tokenMultiplier = Math.floor(
      getTokensMultiplier(interestFraction, minTimeConverted).toNumber(),
    );
    totalTokens = new BN(1).add(totalTokens.mul(new BN(tokenMultiplier)));
  }
  return totalTokens;
};
const lockDurationToMonths = (lockDuration: AllowedStakingDurationMonths): number => {
  let result = 0;
  switch (lockDuration) {
    case AllowedStakingDurationMonths.Zero:
      result = 0;
      break;
    case AllowedStakingDurationMonths.One:
      result = 1;
      break;
    case AllowedStakingDurationMonths.Two:
      result = 2;
      break;
    case AllowedStakingDurationMonths.Three:
      result = 3;
      break;
    case AllowedStakingDurationMonths.Six:
      result = 6;
      break;
    case AllowedStakingDurationMonths.Twelve:
      result = 12;
      break;
    case AllowedStakingDurationMonths.TwentyFour:
      result = 24;
      break;
    default:
      break;
  }
  return result;
};
