import { formatOptions } from "@constants/config";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { amountToUiAmount } from "@utils/bignum";
import {
  getTotalClaimableAmount,
  getTotalNumberOfStakingAccounts,
  getTotalStakedAmount,
} from "@utils/spl/unloc-staking";

const classNames = (...classes: any[]): string => {
  return classes.filter(Boolean).join(" ");
};

export const StakeBalance = (): JSX.Element => {
  const { accounts } = useStakingAccounts();

  const count = getTotalNumberOfStakingAccounts(accounts?.info?.stakingAccounts);
  const totalLocked = getTotalStakedAmount(accounts?.info?.stakingAccounts);
  const totalClaimable = getTotalClaimableAmount(accounts?.info?.stakingAccounts);

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
