import BN from "bn.js";

import { getUnlocScore, getUserLevel } from "@utils/spl/unloc-score";

import { usePoolInfo } from "./usePoolInfo";
import { useStakingAccounts } from "./useStakingAccounts";

export const useUserScore = () => {
  const { data } = usePoolInfo();
  const { accounts } = useStakingAccounts();

  if (data && accounts?.info?.stakingAccounts) {
    const score = getUnlocScore(data, accounts.info);
    const profile = getUserLevel(data, score);

    return {
      isLoading: false,
      score,
      profile,
    };
  }
  return {
    isLoading: true,
    score: new BN(0),
    profile: { level: 0, feeReductionBasisPoints: 0 },
  };
};
