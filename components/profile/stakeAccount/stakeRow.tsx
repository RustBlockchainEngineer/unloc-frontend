import { DurationProgress } from "./durationProgress";
import { amountToUiAmount, numVal, val } from "@utils/bignum";
import dayjs from "dayjs";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { errorCase } from "@utils/toast-error-handler";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { depositTokens, lockDurationEnumToSeconds, withdrawTokens } from "@utils/spl/unloc-staking";
import { BN } from "bn.js";
import {
  AllowedStakingDurationMonths,
  LockedStakingAccount,
  WithdrawType,
} from "@unloc-dev/unloc-sdk-staking";
import { Transaction } from "@solana/web3.js";
import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
import { useStore } from "@hooks/useStore";
import { exitAmount } from "@components/profile/stakeAccount/calculations";

export type StakeType = "flexi" | "liqmin" | "normal";
export type StakeRowProps = { lockedStakingAccount: LockedStakingAccount; type: StakeType };

export const StakeRow = ({ lockedStakingAccount, type }: StakeRowProps) => {
  const { stakingData, index, isActive } = lockedStakingAccount;
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { StakingStore, Lightbox } = useStore();
  const sendAndConfirm = useSendTransaction();

  const uiAmount = amountToUiAmount(stakingData.initialTokensStaked, UNLOC_MINT_DECIMALS);
  const startUnix = val(stakingData.accountLastUpdatedAt);
  const lockDurationInSeconds = lockDurationEnumToSeconds(stakingData.lockDuration);
  const endUnix = startUnix.addn(lockDurationInSeconds);
  const APY = 40;

  const time = Date.now();
  const status = type === "flexi" ? "flexi" : endUnix.gten(time) ? "locked" : "unlocked";

  if (!isActive) {
    return null;
  }

  const Withdraw = async () => {
    try {
      if (!wallet) throw new WalletNotConnectedError();
      const tx = await withdrawTokens(connection, wallet, {
        withType: WithdrawType.Flexi,
        index: 0,
      });
      await sendAndConfirm(tx, "confirmed", true);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  const Relock = async () => {
    try {
      if (!wallet) throw new WalletNotConnectedError();
      Lightbox.setVisible(false);
      StakingStore.resetCreateFormInputs();
      Lightbox.setContent("relockStakes");
      Lightbox.setVisible(true);
      await StakingStore.setAccountToMerge(index, stakingData.lockDuration, uiAmount);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  const Deposit = async () => {
    try {
      if (!wallet) throw new WalletNotConnectedError();
      const ix = await depositTokens(
        connection,
        wallet,
        new BN(10 ** 6),
        AllowedStakingDurationMonths.Zero,
      );
      const tx = new Transaction().add(...ix);
      await sendAndConfirm(tx, "confirmed", true);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  const Merge = async () => {
    if (!wallet) throw new WalletNotConnectedError();

    try {
      Lightbox.setVisible(false);
      // Reset the inputs
      StakingStore.resetCreateFormInputs();
      Lightbox.setContent("mergeStakes");
      Lightbox.setVisible(true);
      await StakingStore.setAccountToMerge(index, stakingData.lockDuration, uiAmount);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  const renderActions = () => {
    const button = ["Deposit", "Relock"];
    if (status === "flexi") {
      button.splice(0, 1, "Withdraw");
    } else if (status === "unlocked" || status === "locked") {
      button.push("Merge");
    } else throw Error("Stake status error");

    const actions = [Deposit, Withdraw, Relock, Merge];

    return button.map((type) => {
      const action = actions.filter((handler) => handler.name === type);
      return (
        <button onClick={action[0]} key={type} className="btn btn--md btn--primary">
          {type}
        </button>
      );
    });
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
          <i className={`icon icon--sm icon--currency--UNLOC`} />
        </div>
        <div className="stakerow__at-exit">
          <p>{exitAmount(uiAmount)}</p>
          <span className="sub">Amount at exit</span>
        </div>
      </div>
      {type !== "flexi" && (
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
      )}
      <div className="stakerow__col">
        <div className="stakerow__title">APY</div>
        <div className="stakerow__apr">{APY}%</div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">
          Status: <strong>{status}</strong>
        </div>
        <div className="stakerow__actions">{renderActions()}</div>
      </div>
    </li>
  );
};
