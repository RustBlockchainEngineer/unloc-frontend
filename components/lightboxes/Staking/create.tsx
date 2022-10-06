import { useStore } from "@hooks/useStore";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createStake, getFarmPoolUserObject } from "@utils/spl/unloc-staking";
import { observer } from "mobx-react-lite";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { getDurationForContractData } from "@utils/timeUtils/timeUtils";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { errorCase } from "@utils/toast-error-handler";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import BN from "bn.js";
import { amountToUiAmount, val } from "@utils/bignum";
import { formatOptions } from "@constants/config";

type InputEvent = ChangeEvent<HTMLInputElement>;

const sliderMarks = {
  0: { label: "No lock", style: { left: "3%" } },
  25: "30",
  50: "60",
  75: "90",
  100: { label: "180", style: { left: "97%" } },
};

function markToDurationMapping(value: number) {
  switch (value) {
    case 0:
      return 0;
    case 25:
      return 30;
    case 50:
      return 60;
    case 75:
      return 90;
    case 100:
      return 180;
    default:
      return 0;
  }
}

function durationToApyBasisPoints(value: number) {
  switch (value) {
    case 0:
      return 50;
    case 30:
      return 2000;
    case 60:
      return 3500;
    case 90:
      return 5500;
    case 180:
      return 9000;
    default:
      return 0;
  }
}

export const CreateStake = observer(() => {
  const { StakingStore, Lightbox } = useStore();
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { accounts, isLoading, mutate } = useStakingAccounts();
  const sendAndConfirm = useSendTransaction();
  const [apy, setApy] = useState(50);

  // Get total staked amount
  const totalStaked = useMemo(
    () =>
      !accounts
        ? new BN(0)
        : accounts?.reduce<BN>((sum, { info, assigned }) => {
            if (assigned && info) {
              return sum.add(val(info.amount));
            }
            return sum;
          }, new BN(0)),
    [accounts],
  );

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!wallet) throw new WalletNotConnectedError();
      if (!accounts) return;

      const stakeSeed = accounts.findIndex((state) => !state.assigned);
      const { uiAmount, lockDuration } = StakingStore.createFormInputs;
      const amount = new BN(uiAmount).muln(10 ** 6);
      const tx = await createStake(connection, wallet, stakeSeed + 1, amount, lockDuration);

      Lightbox.setCanClose(false);
      Lightbox.setContent("circleProcessing");
      await sendAndConfirm(tx);

      // Optimistic
      const unixNow = Math.floor(Date.now() / 1000);
      const info = getFarmPoolUserObject(wallet, amount, stakeSeed + 1, 0, unixNow, lockDuration);
      const address = accounts[stakeSeed].address;
      const newAccounts = [...accounts];
      newAccounts[stakeSeed] = { address, assigned: true, info };

      mutate(newAccounts, { rollbackOnError: true, populateCache: true, revalidate: true });
    } catch (err) {
      errorCase(err);
    } finally {
      Lightbox.setVisible(false);
      Lightbox.setCanClose(true);
    }
  };

  const handleAmountInput = (e: InputEvent) => {
    const value = e.target.value;
    // Check for numbers
    if (!value || value.match(/^\d{1,}(\.\d{0,6})?$/)) {
      StakingStore.setCreateFormInput("uiAmount", value);
    }
  };

  const handleDurationInput = (value: number | number[]) => {
    if (typeof value !== "number") {
      value = value[0];
    }
    value = markToDurationMapping(value);
    const asSeconds = getDurationForContractData(value, "days");
    StakingStore.setCreateFormInput("lockDuration", asSeconds);

    console.log(durationToApyBasisPoints(value));
    setApy(durationToApyBasisPoints(value));
  };

  return (
    <div className="create-stake">
      <h3 className="create-stake__title">Create staking account</h3>
      <div className="create-stake__stats">
        <div className="create-stake__stats-item">
          Staked{" "}
          <strong>{amountToUiAmount(totalStaked, 6).toLocaleString("en-us", formatOptions)}</strong>
        </div>
        <div className="create-stake__stats-item">
          Unloc score <strong>0</strong>
        </div>
      </div>
      <form onSubmit={handleCreate} className="create-stake__form">
        <div className="create-stake__amount">
          <label htmlFor="amount">Amount</label>
          <input
            lang="en"
            value={StakingStore.createFormInputs.uiAmount}
            onChange={handleAmountInput}
            placeholder=""
            name="amount"
            type="text"
          />
        </div>
        <div className="create-stake__duration">
          <label htmlFor="duration">Duration (Days)</label>
          <div className="slider-container">
            <Slider
              onChange={handleDurationInput}
              min={0}
              max={100}
              defaultValue={StakingStore.createFormInputs.lockDuration}
              marks={sliderMarks}
              step={null}
            />
          </div>
        </div>
        <div className="create-stake__apy">
          <p>
            APY <strong>{(apy / 100).toLocaleString("en-us")}%</strong>
          </p>
        </div>

        <div className="create-stake__score">
          <p>
            New UNLOC score <strong>7.7</strong>
          </p>
        </div>

        <button disabled={isLoading} type="submit" className="confirm btn btn--md btn--primary">
          Create
        </button>
      </form>
    </div>
  );
});
