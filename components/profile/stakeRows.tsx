import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { StakeRow } from "./stakeAccount/stakeRow";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { val } from "@utils/bignum";
import { FlexiStakeRow } from "./stakeAccount/flexiStakeRow";

export const StakeRows = () => {
  const { accounts, isLoading, isError } = useStakingAccounts();
  const [parent] = useAutoAnimate<HTMLUListElement>();

  if (isError || isLoading || !accounts || !accounts.info) {
    return null;
  }

  const lockedAccounts = accounts.info.stakingAccounts.locked.lockedStakingsData;
  const flexiData = accounts.info.stakingAccounts.flexi;
  const isFlexiActive = val(flexiData.stakingData.initialTokensStaked).gtn(0);

  return (
    <ul role="list" ref={parent} className="profile__stake-accounts">
      {isFlexiActive && <FlexiStakeRow stakingData={flexiData.stakingData} />}
      {lockedAccounts?.map((row) => (
        <StakeRow key={row.index} lockedStakingAccount={row} type="normal" />
      ))}
    </ul>
  );
};
