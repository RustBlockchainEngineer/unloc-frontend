import { formatOptions } from "@constants/config";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { amountToUiAmount, val } from "@utils/bignum";
import BN from "bn.js";

const classNames = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

export const StakeBalance = () => {
  const { accounts } = useStakingAccounts();
  const count = accounts?.filter(({ assigned }) => assigned).length;

  const totalLocked =
    accounts?.reduce<BN>((sum, { info, assigned }) => {
      if (assigned && info) {
        return sum.add(val(info.amount));
      }
      return sum;
    }, new BN(0)) || new BN(0);

  const totalClaimable =
    // accounts?.reduce<BN>((sum, { info, assigned }) => {
    //   if (
    //     assigned &&
    //     info &&
    //     time &&
    //     val(info.lastStakeTime).add(val(info.lockDuration)).gten(time)
    //   ) {
    //     sum.add(val(info.amount)).add(val(info.rewardAmount));
    //   }
    //   return sum;
    // }, new BN(0)) ||
    new BN(0);

  return (
    <article className="stake__balance col">
      <div className="top">UNLOC STAKED</div>
      <div className="stake__amounts">
        <div
          className={classNames("amount__locked", totalLocked.eqn(0) && "amount__locked--empty")}>
          <span>{amountToUiAmount(totalLocked, 6).toLocaleString("en-us", formatOptions)}</span>
        </div>
        <div
          className={classNames("amount__claim", totalClaimable.eqn(0) && "amount__claim--empty")}>
          <div>{amountToUiAmount(totalClaimable, 6).toLocaleString("en-us", formatOptions)}</div>
          <div className="sub">Available to claim!</div>
        </div>
      </div>
      <p className="stake__summary">{count ?? 0} staking accounts</p>
    </article>
  );
};
