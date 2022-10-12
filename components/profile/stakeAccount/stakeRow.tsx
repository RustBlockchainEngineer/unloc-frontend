import { useCallback, useMemo } from "react";
import { DurationProgress } from "./durationProgress";
import { amountToUiAmount, numVal, val } from "@utils/bignum";
import dayjs from "dayjs";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { errorCase } from "@utils/toast-error-handler";
import { useSendTransaction } from "@hooks/useSendTransaction";
import {
  depositTokens,
  lockDurationEnumToSeconds,
  relockStakingAccount,
  withdrawTokens,
} from "@utils/spl/unloc-staking";
import { BN } from "bn.js";
import {
  AllowedStakingDurationMonths,
  LockedStakingAccount,
  RelockType,
  WithdrawType,
} from "@unloc-dev/unloc-sdk-staking";
import { Transaction } from "@solana/web3.js";
import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";

export type StakeType = "flexi" | "liqmin" | "normal";
export type StakeRowProps = { lockedStakingAccount: LockedStakingAccount; type: StakeType };

export const StakeRow = ({ lockedStakingAccount, type }: StakeRowProps) => {
  const { stakingData, index, isActive } = lockedStakingAccount;
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
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

  const handleWithdraw = async () => {
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
  const handleRelock = async () => {
    try {
      if (!wallet) throw new WalletNotConnectedError();
      const tx = await relockStakingAccount(
        wallet,
        { relockType: RelockType.Flexi, index: 0 },
        AllowedStakingDurationMonths.Zero,
      );
      await sendAndConfirm(tx, "confirmed", true);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };
  const handleDeposit = async () => {
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

  // TODO: import this from somewhere, use a proper formula
  const exitAmount = useMemo(
    () =>
      (uiAmount * 1.1).toLocaleString("en-us", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false,
      }),
    [uiAmount],
  );

  const renderActions = useCallback(() => {
    let buttons = [];
    switch (status) {
      case "flexi":
        buttons = ["Deposit", "Withdraw", "Relock"];
        break;
      case "unlocked":
        buttons = ["Deposit", "Withdraw", "Relock"];
        break;
      case "locked":
        buttons = ["Deposit", "Withdraw", "Relock"];
        break;
      default:
        throw Error("Stake status error");
    }

    return buttons.map((button) => {
      switch (button) {
        case "Deposit":
          return (
            <button onClick={handleDeposit} key={button} className="btn btn--md btn--primary">
              {button}
            </button>
          );
        case "Withdraw":
          return (
            <button onClick={handleWithdraw} key={button} className="btn btn--md btn--primary">
              {button}
            </button>
          );
        case "Relock":
          return (
            <button onClick={handleRelock} key={button} className="btn btn--md btn--primary">
              {button}
            </button>
          );
        default:
          return (
            <button key={button} className="btn btn--md btn--primary">
              {button}
            </button>
          );
      }
    });
  }, [status]);

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
          <p>{exitAmount}</p>
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
