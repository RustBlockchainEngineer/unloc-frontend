import BN from "bn.js";

import { getUnlocScore, getUserLevel } from "@utils/spl/unloc-score";

import { usePoolInfo } from "./usePoolInfo";
import { useStakingAccounts } from "./useStakingAccounts";

export const useUserScore = (): {
  isLoading: boolean;
  score: BN;
  profile: { level: number; feeReductionBasisPoints: number };
} => {
  const { data } = usePoolInfo();
  const { accounts } = useStakingAccounts();

  if (data != null && accounts?.info?.stakingAccounts != null) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const score = getUnlocScore(data, accounts.info);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const profile = getUserLevel(data, score);

    return {
      isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      score,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      profile,
    };
  }
  return {
    isLoading: true,
    score: new BN(0),
    profile: { level: 0, feeReductionBasisPoints: 0 },
  };
};
