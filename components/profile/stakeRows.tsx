import { useAutoAnimate } from "@formkit/auto-animate/react";

import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { val } from "@utils/bignum";

import { FlexiStakeRow } from "./stakeAccount/flexiStakeRow";
import { StakeRow } from "./stakeAccount/stakeRow";

export const StakeRows = (): JSX.Element | null => {
  const { accounts, isLoading, isError } = useStakingAccounts();
  const [parent] = useAutoAnimate<HTMLUListElement>();

  if (isError != null || isLoading || accounts == null || accounts.info == null) return null;

  const lockedAccounts = accounts.info.stakingAccounts.locked.lockedStakingsData;
  const flexiData = accounts.info.stakingAccounts.flexi;
  const isFlexiActive = val(flexiData.stakingData.initialTokensStaked).gtn(0);

  return (
    <ul role="list" ref={parent} className="profile__stake-accounts">
      {isFlexiActive && <FlexiStakeRow stakingData={flexiData.stakingData} />}
      {lockedAccounts?.map((row) => (
        <StakeRow key={row.index} lockedStakingAccount={row} />
      ))}
    </ul>
  );
};
