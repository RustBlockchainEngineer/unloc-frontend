import { PublicKey } from "@solana/web3.js";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { useCallback, useMemo } from "react";
import { DurationProgress } from "./durationProgress";

export type stakeStatus = "flexi" | "unlocked" | "locked";

export interface IStakeRow {
  id: number;
  address: PublicKey;
  amount: number;
  uiAmount: string;
  APR: number;
  status: stakeStatus;
  startDate?: Date;
  endDate?: Date;
}

function toUnix(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export const StakeRow = ({ id, address, uiAmount, APR, status, startDate, endDate }: IStakeRow) => {
  const pubkey = useMemo(() => compressAddress(4, address.toString()), [address]);

  // TODO: import this from somewhere, use a proper formula
  const exitAmount = useMemo(
    () =>
      (parseFloat(uiAmount) * 1.1).toLocaleString("en-us", {
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
        buttons = ["Claim"];
        break;
      case "unlocked":
        buttons = ["Claim", "Relock"];
        break;
      case "locked":
        buttons = ["Claim", "Unlock", "Relock"];
        break;
      default:
        throw new Error("Stake status error");
    }

    return buttons.map((button) => (
      <button key={button} className="btn btn--md btn--primary">
        {button}
      </button>
    ));
  }, [status]);

  return (
    <article className="stakerow">
      <div className="stakerow__col--id">
        <div className="stakerow__id">{id}</div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">Address</div>
        <div className="stakerow__address">{pubkey}</div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">Staked amount</div>
        <div className="stakerow__amount">
          {uiAmount}
          <i className={`icon icon--sm icon--currency--UNLOC`} />
        </div>
        <div className="stakerow__at-exit">
          <p>{exitAmount}</p>
          <span className="sub">Amount at exit</span>
        </div>
      </div>
      {startDate && endDate && (
        <div className="stakerow__col--duration">
          <div className="stakerow__title">
            <p>Start date</p>
            <p className="date">01.05.22</p>
          </div>
          <div className="stakerow__progress">
            <DurationProgress startUnix={toUnix(startDate)} endUnix={toUnix(endDate)} />
          </div>
          <div className="stakerow__title">
            <p>End date</p>
            <p className="date">01.08.22</p>
          </div>
        </div>
      )}
      <div className="stakerow__col">
        <div className="stakerow__title">APR</div>
        <div className="stakerow__apr">{APR}%</div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">
          Status: <strong>{status}</strong>
        </div>
        <div className="stakerow__actions">{renderActions()}</div>
      </div>
    </article>
  );
};
