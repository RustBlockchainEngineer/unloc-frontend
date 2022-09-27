import { useCallback, useMemo } from "react";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { DurationProgress } from "./durationProgress";
import { StakeRowType } from "../stakeRows";
import { amountToUiAmount } from "@utils/bignum";
import dayjs from "dayjs";

export type StakeStatus = "flexi" | "unlocked" | "locked";

function toUnix(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

const UNLOC_MINT_DECIMALS = 6;

export const StakeRow = ({
  id,
  address,
  amount,
  APR,
  status,
  startDate,
  endDate,
}: StakeRowType & { id: number }) => {
  const pubkey = useMemo(() => compressAddress(4, address.toString()), [address]);
  const uiAmount = amountToUiAmount(amount, UNLOC_MINT_DECIMALS);

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
          {uiAmount.toLocaleString("en-us")}
          <i className={`icon icon--sm icon--currency--UNLOC`} />
        </div>
        <div className="stakerow__at-exit">
          <p>{exitAmount}</p>
          <span className="sub">Amount at exit</span>
        </div>
      </div>
      <div className="stakerow__col--duration">
        <div className="stakerow__title">
          <p>Start date</p>
          <p className="date">{dayjs(startDate).format("DD.MM.YYYY")}</p>
        </div>
        <div className="stakerow__progress">
          <DurationProgress startUnix={toUnix(startDate)} endUnix={toUnix(endDate)} />
        </div>
        <div className="stakerow__title">
          <p>End date</p>
          <p className="date">{dayjs(endDate).format("DD.MM.YYYY")}</p>
        </div>
      </div>
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
