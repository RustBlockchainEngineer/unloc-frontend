import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { StakeRow } from "./stakeAccount/stakeRow";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const StakeRows = () => {
  const { accounts } = useStakingAccounts();
  const [parent] = useAutoAnimate<HTMLUListElement>();

  const lockedAccounts = accounts?.info?.stakingAccounts.locked.lockedStakingsData;

  return (
    <ul role="list" ref={parent} className="profile__stake-accounts">
      {lockedAccounts?.map((row) => (
        <StakeRow
          key={row.index}
          index={row.index}
          isActive={row.isActive}
          stakingData={row.stakingData}
        />
      ))}
    </ul>
  );
};
