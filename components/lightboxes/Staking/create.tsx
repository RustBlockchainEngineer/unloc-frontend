import { useStore } from "@hooks/useStore";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { stake } from "@utils/spl/unloc-staking";
import { observer } from "mobx-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ChangeEvent, FormEvent } from "react";
import { getDurationForContractData } from "@utils/timeUtils/timeUtils";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { errorCase } from "@utils/toast-error-handler";

type InputEvent = ChangeEvent<HTMLInputElement>;
const sliderMarks = {
  0: "No Lock",
  25: "30",
  50: "60",
  75: "90",
  100: "180",
};

export const CreateStake = observer(() => {
  const { StakingStore, Lightbox } = useStore();
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!wallet) throw new WalletNotConnectedError();

      const { amount, lockDuration } = StakingStore.createFormInputs;
      const tx = await stake(connection, wallet, Number(amount), lockDuration);

      Lightbox.setCanClose(false);
      Lightbox.setContent("circleProcessing");
      await sendAndConfirm(tx);
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
      StakingStore.setCreateFormInput("amount", value);
    }
  };

  const handleDurationInput = (value: number | number[]) => {
    if (typeof value !== "number") {
      value = value[0];
    }
    const asSeconds = getDurationForContractData(value, "days");
    StakingStore.setCreateFormInput("lockDuration", asSeconds);
  };

  return (
    <div className="create-stake">
      <h3 className="create-stake__title">Create staking account</h3>
      <div className="create-stake__stats">
        <div className="create-stake__stats-item">
          Staked <strong>721</strong>
        </div>
        <div className="create-stake__stats-item">
          Unloc score <strong>7.1</strong>
        </div>
      </div>
      <form onSubmit={handleCreate} className="create-stake__form">
        <div className="create-stake__amount">
          <label htmlFor="amount">Amount</label>
          <input
            lang="en"
            value={StakingStore.createFormInputs.amount}
            onChange={handleAmountInput}
            placeholder="100"
            name="amount"
            type="text"
          />
        </div>
        <div className="create-stake__duration">
          <label htmlFor="duration">Duration (Days)</label>
          <Slider
            onChange={handleDurationInput}
            min={0}
            defaultValue={StakingStore.createFormInputs.lockDuration}
            marks={sliderMarks}
            step={null}
          />
        </div>
        <div className="create-stake__apy"></div>

        <div className="create-stake__score">
          <p>
            New UNLOC score <strong>7.7</strong>
          </p>
        </div>

        <button type="submit" className="confirm btn btn--md btn--primary">
          Create
        </button>
      </form>
    </div>
  );
});
