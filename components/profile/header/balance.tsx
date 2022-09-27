import { formatOptions } from "@constants/config";
import { useSolanaUnixTime } from "@hooks/useSolanaUnixTime";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { amountToUiAmount, val } from "@utils/bignum";
import BN from "bn.js";

export const StakeBalance = () => {
  const { accounts } = useStakingAccounts();
  const time = useSolanaUnixTime();

  const count = accounts?.filter(({ assigned }) => assigned).length;

  const totalLocked = accounts?.reduce<BN>((sum, { info, assigned }) => {
    if (assigned && info) {
      return sum.add(val(info.amount));
    }
    return sum;
  }, new BN(0));

  const totalClaimable = accounts?.reduce<BN>((sum, { info, assigned }) => {
    if (
      assigned &&
      info &&
      time &&
      val(info.lastStakeTime).add(val(info.lockDuration)).gten(time)
    ) {
      sum.add(val(info.amount)).add(val(info.rewardAmount));
    }
    return sum;
  }, new BN(0));

  return (
    <article className="stake__balance col">
      <div className="top">UNLOC STAKED</div>
      <div className="stake__amounts">
        <div className="amount__locked">
          <span>
            {amountToUiAmount(totalLocked ?? 0, 6).toLocaleString("en-us", formatOptions)}
          </span>
        </div>
        <div className="separator"></div>
        <div className="amount__claim">
          <div>
            {amountToUiAmount(totalClaimable ?? 0, 6).toLocaleString("en-us", formatOptions)}
          </div>
          <div className="sub">Available to claim!</div>
        </div>
      </div>
      <p>{count ?? 0} staking accounts</p>
    </article>
  );
};
