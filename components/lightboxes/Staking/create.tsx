import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { useStore } from "@hooks/useStore";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { observer } from "mobx-react-lite";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { errorCase } from "@utils/toast-error-handler";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import BN from "bn.js";
import { amountToUiAmount } from "@utils/bignum";
import { formatOptions } from "@constants/config";
import { useSendTransaction } from "@hooks/useSendTransaction";
import {
  convertDayDurationToEnum,
  createStakingUserOptionally,
  depositTokens,
  getTotalStakedAmount,
} from "@utils/spl/unloc-staking";
import { Transaction } from "@solana/web3.js";
import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";

type InputEvent = ChangeEvent<HTMLInputElement>;

const sliderMarks = {
  0: { label: "No lock", style: { left: "3%" } },
  25: "30",
  50: "90",
  75: "180",
  100: { label: "365", style: { left: "97%" } },
};

function markToDurationMapping(value: number) {
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
    //TODO: absent case for 365 days. For now it returns 0
    default:
      return 0;
  }
}

const amountPart = [25, 50, 75, 100];

export const CreateStake = observer(() => {
  const { StakingStore, Lightbox, Wallet } = useStore();
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { isLoading, accounts } = useStakingAccounts();

  const [apy, setApy] = useState(50);
  const uiAmount = StakingStore.createFormInputs.uiAmount;
  const [selectedAmountInPercent, setAmountInPercent] = useState<number>(0);

  const [currentAmount, setCurrentAmount] = useState<number>(
    Number(uiAmount) ? Number(uiAmount) : 0,
  );

  const sendAndConfirm = useSendTransaction();

  // Get total staked amount
  const totalStaked = getTotalStakedAmount(accounts?.info?.stakingAccounts);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!wallet) throw new WalletNotConnectedError();

      const { uiAmount, lockDuration } = StakingStore.createFormInputs;
      const amount = new BN(uiAmount).muln(10 ** UNLOC_MINT_DECIMALS);
      const lockDurationEnum = convertDayDurationToEnum(lockDuration);
      const ix1 = await createStakingUserOptionally(connection, wallet);
      const ix2 = await depositTokens(connection, wallet, amount, lockDurationEnum);
      const tx = new Transaction().add(...ix1, ...ix2);

      await sendAndConfirm(tx, "confirmed", true);
    } catch (err) {
      console.log(err);
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
      setAmountInPercent(0);
      if (Number(value) >= Wallet.unlocAmount) {
        setCurrentAmount(Wallet.unlocAmount);
      } else {
        setCurrentAmount(Number(value));
      }
    }
  };

  const handleDurationInput = (value: number | number[]) => {
    if (typeof value !== "number") {
      value = value[0];
    }
    value = markToDurationMapping(value);
    StakingStore.setCreateFormInput("lockDuration", value);
    setApy(durationToApyBasisPoints(value));
  };

  const handleAmount = (amount: number) => {
    setAmountInPercent((prevState) => (prevState === amount ? 0 : amount));
  };

  const calculateSelectedAmount = () => {
    const percentsToAmount = Wallet.unlocAmount / (100 / selectedAmountInPercent);
    setCurrentAmount(percentsToAmount);
    StakingStore.setCreateFormInput("uiAmount", percentsToAmount.toString());
  };

  useEffect(() => {
    if (selectedAmountInPercent > 0) calculateSelectedAmount();
  }, [selectedAmountInPercent]);

  return (
    <div className="create-stake">
      <h3 className="create-stake__title">Create staking account</h3>
      <div className="create-stake__stats">
        <div className="create-stake__stats-item">
          Staked{" "}
          <strong>{amountToUiAmount(totalStaked, 6).toLocaleString("en-us", formatOptions)}</strong>
        </div>
        <div className="create-stake__stats-item">
          Unloc score <strong>{0}</strong>
        </div>
      </div>
      <div className="create-stake__stats row-division">
        <div className="create-stake__wallet">
          <p className="label">Current Wallet Balance</p>
          <p className="balance">
            {Wallet.unlocAmount} <i className={`icon icon--sm icon--currency--UNLOC--violet`} />
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
              <AmountItem
                key={amount}
                onClick={handleAmount}
                chosen={selectedAmountInPercent === amount}
                amount={amount}
              />
            );
          })}
        </div>
      </div>

      <form onSubmit={handleCreate} className="create-stake__form">
        <div className="create-stake__amount row-division">
          <label htmlFor="amount">Custom Amount</label>
          <input
            lang="en"
            value={currentAmount || 0}
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

interface IProps {
  amount: number;
  onClick: (amount: number) => void;
  chosen: boolean;
}

const AmountItem = ({ amount, onClick, chosen }: IProps) => {
  return (
    <div onClick={() => onClick(amount)} className={`amount-item ${chosen ? "active" : ""}`}>
      <p>{amount}%</p>
    </div>
  );
};
