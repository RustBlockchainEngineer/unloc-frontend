import { bignum } from "@metaplex-foundation/beet";
import {
  AllowedStakingDurationMonths,
  StakingData,
  PoolInfo,
  ScoreMultiplier,
  UserStakingsInfo,
} from "@unloc-dev/unloc-sdk-staking";
import { numVal, val } from "@utils/bignum";
import BN from "bn.js";
import { lockDurationEnumToSeconds } from "./unloc-staking";
import { Decimal } from "decimal.js";

export const getUnlocScore = (poolInfo: PoolInfo, user: UserStakingsInfo) => {
  const { liqMinRwds, locked } = user.stakingAccounts;
  // Flexi always has a score of 0

  // Liquidity mining score contribution
  const scoreLiqMin = getUnlocScoreContribution(liqMinRwds.stakingData, poolInfo);

  // For locked acocounts, we need to sum the score of each active staking
  const scoreLocked = locked.lockedStakingsData.reduce((sum, account) => {
    return account.indexInUse
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

export const getUserLevel = (poolInfo: PoolInfo, score: bignum) => {
  const { level0, level1, level2, level3, level4, level5 } = poolInfo.profileLevelMultiplier;

  score = val(score);
  if (score.gte(val(level5.minUnlocScore))) {
    return { level: 5, feeReductionBasisPoints: numVal(level5.feeReductionBasisPoints) };
  } else if (score.gte(val(level4.minUnlocScore))) {
    return { level: 4, feeReductionBasisPoints: numVal(level4.feeReductionBasisPoints) };
  } else if (score.gte(val(level3.minUnlocScore))) {
    return { level: 3, feeReductionBasisPoints: numVal(level3.feeReductionBasisPoints) };
  } else if (score.gte(val(level2.minUnlocScore))) {
    return { level: 2, feeReductionBasisPoints: numVal(level2.feeReductionBasisPoints) };
  } else if (score.gte(val(level1.minUnlocScore))) {
    return { level: 1, feeReductionBasisPoints: numVal(level1.feeReductionBasisPoints) };
  } else {
    return { level: 0, feeReductionBasisPoints: numVal(level0.feeReductionBasisPoints) };
  }
};

const timeElapsedSeconds = (accountLastUpdatedAt: bignum) => {
  // TODO: Date.now() should be replaced with SYSVAR_CLOCK
  const now = Math.floor(Date.now() / 1000);
  return new BN(now).sub(val(accountLastUpdatedAt));
};

const remainingLockDurationSeconds = (
  accountLastUpdatedAt: bignum,
  lockDuration: AllowedStakingDurationMonths,
) => {
  // Timestamps shouldn't overflow the number primitive, at least not any time soon
  const timeElapsed = timeElapsedSeconds(accountLastUpdatedAt).toNumber();
  const lockDurationSeconds = lockDurationEnumToSeconds(lockDuration);

  if (lockDurationSeconds > timeElapsed) {
    return lockDurationSeconds - timeElapsed;
  }
  return 0;
};

const getScoreMultiplier = (
  multipliers: ScoreMultiplier,
  initialLockDuration: AllowedStakingDurationMonths,
  remainingLockDuration: number,
) => {
  if (initialLockDuration === AllowedStakingDurationMonths.Zero) {
    return multipliers.flexi;
  }

  if (initialLockDuration === AllowedStakingDurationMonths.Two) {
    return multipliers.liqMin;
  }

  if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.Twelve)) {
    return multipliers.rldm2412;
  } else if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.Six)) {
    return multipliers.rldm126;
  } else if (
    remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.Three)
  ) {
    return multipliers.rldm63;
  } else if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.One)) {
    return multipliers.rldm31;
  } else if (remainingLockDuration > lockDurationEnumToSeconds(AllowedStakingDurationMonths.Zero)) {
    return multipliers.rldm10;
  } else {
    return { numerator: 0, denominator: 0 };
  }
};

export const getTotalTokens = () => {};
