import { ChangeEvent, FormEvent, useState } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import { StakingPoolInfo } from "@unloc-dev/unloc-sdk-staking";
import { observer } from "mobx-react-lite";
import Slider from "rc-slider";

import "rc-slider/assets/index.css";
import { formatOptions, UNLOC_STAKING_PID } from "@constants/config";
import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
import { usePoolInfo } from "@hooks/usePoolInfo";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { useStore } from "@hooks/useStore";
import { useUserScore } from "@hooks/useUserScore";
import { amountToUiAmount } from "@utils/bignum";
import { uiAmountToAmount } from "@utils/spl/common";
import { getUnlocScoreContributionForLightbox } from "@utils/spl/unloc-score";
import {
  convertDayDurationToEnum,
  createStakingUserOptionally,
  depositTokens,
  getTotalStakedAmount,
  reallocUserAccountOptionally,
} from "@utils/spl/unloc-staking";
import { errorCase, successCase } from "@utils/toast-error-handler";

type InputEvent = ChangeEvent<HTMLInputElement>;

const sliderMarks = {
  0: { label: "No lock", style: { left: "3%" } },
  25: "30",
  50: "90",
  75: "180",
  100: { label: "365", style: { left: "97%" } },
};

function markToDurationMapping(value: number): number {
  switch (value) {
    case 0:
      return 0;
    case 25:
      return 30;
    case 50:
      return 90;
    case 75:
      return 180;
    case 100:
      return 365;
    default:
      return 0;
  }
}

function durationToApyBasisPoints(value: number): number {
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
      return 8000;
    case 365:
      return 12000;
    default:
      return 0;
  }
}

const amountPart = [25, 50, 75, 100];

export const CreateStake = observer(() => {
  const { StakingStore, Lightbox, Wallet } = useStore();
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { isLoading, accounts, mutate } = useStakingAccounts();
  const { score } = useUserScore();
  const { data } = usePoolInfo();

  const [apy, setApy] = useState(50);
  const [userScoreContribution, setUserScoreContribution] = useState<string>("0");
  const { uiAmount, lockDuration } = StakingStore.createFormInputs;

  const sendAndConfirm = useSendTransaction();

  // Get total staked amount
  const totalStaked = getTotalStakedAmount(accounts?.info?.stakingAccounts);

  const handleCreate = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (wallet == null) throw new WalletNotConnectedError();

      const { uiAmount, lockDuration } = StakingStore.createFormInputs;
      const amount = uiAmountToAmount(uiAmount, UNLOC_MINT_DECIMALS);
      const lockDurationEnum = convertDayDurationToEnum(lockDuration);

      const ix1 = await createStakingUserOptionally(connection, wallet, UNLOC_STAKING_PID);

      // Maybe we need to realloc?
      let ix2: TransactionInstruction[] = [];
      if (accounts?.info?.stakingAccounts)
        ix2 = reallocUserAccountOptionally(wallet, accounts.info);

      const ix3 = await depositTokens(
        connection,
        wallet,
        amount,
        lockDurationEnum,
        UNLOC_STAKING_PID,
      );
      const tx = new Transaction().add(...ix1, ...ix2, ...ix3);

      const { result } = await sendAndConfirm(tx);
      if (result.value.err) {
        console.log({ err: result.value.err });
        throw Error("Failed to create a staking account.");
      }
      successCase("Staking account created");
      void mutate();
    } catch (err) {
      console.log({ err });
      errorCase(err);
    } finally {
      Lightbox.setVisible(false);
      Lightbox.setCanClose(true);
    }
  };

  const handleAmountInput = (e: InputEvent): void => {
    const value = e.target.value;
    // Check for numbers
    if (!value || value.match(/^\d{1,}(\.\d{0,6})?$/) != null) {
      StakingStore.setCreateFormInput("uiAmount", value);

      // Set the score contribution that this stake would have
      const amount = uiAmountToAmount(uiAmount, UNLOC_MINT_DECIMALS);
      const score = getUnlocScoreContributionForLightbox(
        amount,
        lockDuration,
        data as StakingPoolInfo,
      );
      setUserScoreContribution(score.toString());
    }
  };

  const handleDurationInput = (value: number | number[]): void => {
    if (typeof value !== "number") value = value[0];

    const durationInDays = markToDurationMapping(value);
    StakingStore.setCreateFormInput("lockDuration", durationInDays);
    setApy(durationToApyBasisPoints(durationInDays));

    // Set the score contribution that this stake would have
    const amount = uiAmountToAmount(uiAmount, UNLOC_MINT_DECIMALS);
    const score = getUnlocScoreContributionForLightbox(
      amount,
      durationInDays,
      data as StakingPoolInfo,
    );
    setUserScoreContribution(score.toString());
  };

  const handleAmountPercent = (amount: number) => () => {
    const percentsToAmount = Wallet.unlocAmount / (100 / amount);
    StakingStore.setCreateFormInput("uiAmount", percentsToAmount.toString());
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
          Unloc score <strong>{score.toString()}</strong>
        </div>
      </div>
      <div className="create-stake__stats row-division">
        <div className="create-stake__wallet">
          <p className="label">Current Wallet Balance</p>
          <p className="balance">
            {Wallet.unlocAmount} <i className={"icon icon--sm icon--currency--UNLOC--violet"} />
          </p>
        </div>
      </div>

      <div className="create-stake__stats col">
        <div className="create-stake__wallet">
          <p className="label">Amount Settings</p>
        </div>
        <div className="create-stake__amount-list">
          {amountPart.map((amount) => {
            return (
              <button
                type="button"
                key={amount}
                onClick={handleAmountPercent(amount)}
                className="amount-item">
                <p>{amount}%</p>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleCreate} className="create-stake__form">
        <div className="create-stake__amount row-division">
          <label htmlFor="amount">Custom Amount</label>
          <input
            lang="en"
            value={uiAmount || 0}
            onChange={handleAmountInput}
            placeholder=""
            name="amount"
            type="text"
          />
        </div>
        <div className="create-stake__duration row-division">
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

        <div className="create-stake__score__apy">
          <p>
            APY <strong>{(apy / 100).toLocaleString("en-us")}%</strong>
          </p>
          <p>
            New UNLOC score <strong>{userScoreContribution}</strong>
          </p>
        </div>

        <button disabled={isLoading} type="submit" className="confirm btn btn--md btn--primary">
          Create
        </button>
      </form>
    </div>
  );
});
