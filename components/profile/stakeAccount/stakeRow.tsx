import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { Transaction } from "@solana/web3.js";
import {
  // AllowedStakingDurationMonths,
  LockedStakingAccount,
  // StakingPoolInfo,
  WithdrawType,
} from "@unloc-dev/unloc-sdk-staking";
// import BN from "bn.js";
import dayjs from "dayjs";

import { exitAmount } from "@components/profile/stakeAccount/calculations";
import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
// import { usePoolInfo } from "@hooks/usePoolInfo";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { useStore } from "@hooks/useStore";
import { amountToUiAmount, numVal, val } from "@utils/bignum";
// import { getEarnedSoFar } from "@utils/spl/unloc-score";
import { lockDurationEnumToSeconds, withdrawTokens } from "@utils/spl/unloc-staking";
import { errorCase } from "@utils/toast-error-handler";

import { DurationProgress } from "./durationProgress";

export interface StakeRowProps {
  lockedStakingAccount: LockedStakingAccount;
}

export const StakeRow = ({ lockedStakingAccount }: StakeRowProps): JSX.Element | null => {
  const { stakingData, index, indexInUse } = lockedStakingAccount;
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { StakingStore, Lightbox } = useStore();
  // const { data, isLoading } = usePoolInfo();
  const sendAndConfirm = useSendTransaction();

  const uiAmount = amountToUiAmount(stakingData.initialTokensStaked, UNLOC_MINT_DECIMALS);
  const startUnix = val(stakingData.accountLastUpdatedAt);
  const lockDurationInSeconds = lockDurationEnumToSeconds(stakingData.lockDuration);
  const endUnix = startUnix.addn(lockDurationInSeconds);
  const APY = 40;
  // const earned = isLoading ? "Loading..." : getEarnedSoFar(stakingData, data as StakingPoolInfo);
  const earned = exitAmount(uiAmount);

  const time = Date.now();
  const status = endUnix.gten(time) ? "locked" : "unlocked";

  if (!indexInUse) return null;

  const handleWithdraw = async (): Promise<void> => {
    try {
      if (wallet == null) throw new WalletNotConnectedError();
      const tx = await withdrawTokens(connection, wallet, {
        withType: WithdrawType.Flexi,
        index: 0,
      });
      await sendAndConfirm(tx, { skipPreflight: true });
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  const handleRelock = () => {
    try {
      if (wallet == null) throw new WalletNotConnectedError();
      Lightbox.setVisible(false);
      StakingStore.resetCreateFormInputs();
      Lightbox.setContent("relockStakes");
      Lightbox.setVisible(true);
      StakingStore.setAccountToMerge(index, stakingData.lockDuration, uiAmount);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  const handleMerge = (): void => {
    if (wallet == null) throw new WalletNotConnectedError();

    try {
      Lightbox.setVisible(false);
      // Reset the inputs
      StakingStore.resetCreateFormInputs();
      Lightbox.setContent("mergeStakes");
      Lightbox.setVisible(true);
      StakingStore.setAccountToMerge(index, stakingData.lockDuration, uiAmount);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  return (
    <li className="stakerow">
      <div className="stakerow__col--id">
        <div className="stakerow__id">{index + 1}</div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">Staked amount</div>
        <div className="stakerow__amount">
          {uiAmount.toLocaleString("en-us")}
          <i className={"icon icon--sm icon--currency--UNLOC"} />
        </div>
        <div className="stakerow__at-exit">
          <p>{earned?.toString()}</p>
          <span className="sub">Amount at exit</span>
        </div>
      </div>

      <div className="stakerow__col--duration">
        <div className="stakerow__title">
          <p>Start date</p>
          <p className="date">{dayjs(numVal(startUnix) * 1000).format("DD.MM.YYYY")}</p>
        </div>
        <div className="stakerow__progress">
          <DurationProgress startUnix={numVal(startUnix)} endUnix={numVal(endUnix)} />
        </div>
        <div className="stakerow__title">
          <p>End date</p>
          <p className="date">{dayjs(numVal(endUnix) * 1000).format("DD.MM.YYYY")}</p>
        </div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">APY</div>
        <div className="stakerow__apr">{APY}%</div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">
          Status: <strong>{status}</strong>
        </div>
        <div className="stakerow__actions">
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={status === "locked"}
            className={`btn btn--md ${status === "locked" ? "btn--disabled" : "btn--primary"}`}>
            Withdraw
          </button>
          <button onClick={handleRelock} className="btn btn--md btn--primary">
            Relock
          </button>
          <button onClick={handleMerge} className="btn btn--md btn--primary">
            Merge
          </button>
        </div>
      </div>
    </li>
  );
};
