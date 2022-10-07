import { useCallback, useMemo } from "react";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { DurationProgress } from "./durationProgress";
import { StakeRowType } from "../stakeRows";
import { amountToUiAmount, numVal } from "@utils/bignum";
import dayjs from "dayjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { errorCase } from "@utils/toast-error-handler";

export type StakeStatus = "flexi" | "unlocked" | "locked";

const UNLOC_MINT_DECIMALS = 6;

export const StakeRow = ({
  id,
  address,
  amount,
  APY,
  status,
  startUnix,
  endUnix,
}: StakeRowType & { id: number }) => {
  // const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  // const sendAndConfirm = useSendTransaction();
  const pubkey = useMemo(() => compressAddress(4, address.toString()), [address]);
  const uiAmount = amountToUiAmount(amount, UNLOC_MINT_DECIMALS);

  const handleHarvest = async () => {
    try {
      if (!wallet) throw new WalletNotConnectedError();
      // const tx = await harvest(connection, wallet, address);
      // await sendAndConfirm(tx);
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
        buttons = ["Withdraw"];
        break;
      case "unlocked":
        buttons = ["Withdraw", "Harvest"];
        break;
      case "locked":
        buttons = ["Withdraw", "Harvest"];
        break;
      default:
        throw Error("Stake status error");
    }

    return buttons.map((button) => {
      switch (button) {
        case "Withdraw":
          const locked = status === "locked";
          return (
            <button
              disabled={locked}
              key={button}
              className={`btn btn--md ${locked ? "btn--disabled" : "btn--primary"}`}>
              {button}
            </button>
          );
        case "Harvest":
          return (
            <button onClick={handleHarvest} key={button} className="btn btn--md btn--primary">
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
        <div className="stakerow__actions">{renderActions()}</div>
      </div>
    </li>
  );
};
