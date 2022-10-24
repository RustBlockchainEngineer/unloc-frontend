import { FormEvent, useEffect, useState } from "react";

import Slider from "rc-slider";

import { useWallet } from "@solana/wallet-adapter-react";
import { useStore } from "@hooks/useStore";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { errorCase } from "@utils/toast-error-handler";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { amountToUiAmount } from "@utils/bignum";
import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
import { AllowedStakingDurationMonths, LockedStakingAccount } from "@unloc-dev/unloc-sdk-staking";
import { mergeStakingAccounts } from "@utils/spl/unloc-staking";
import { useSendTransaction } from "@hooks/useSendTransaction";

const defaultSliderMarks = {
  0: { label: "No lock", style: { left: "3%" } },
  20: "30",
  40: "90",
  60: "180",
  80: "365",
  100: { label: "730", style: { left: "97%" } },
};

const minLockDurationToDays = (minLockDuration: number) => {
  switch (minLockDuration) {
    case 1:
      return 30;
    case 3:
      return 90;
    case 4:
      return 180;
    case 5:
      return 365;
    case 6:
      return 730;
    default:
      return 0;
  }
};

const daysToLockDuration = (days: number): AllowedStakingDurationMonths => {
  switch (days) {
    case 30:
      return AllowedStakingDurationMonths.One;
    case 90:
      return AllowedStakingDurationMonths.Three;
    case 180:
      return AllowedStakingDurationMonths.Six;
    case 365:
      return AllowedStakingDurationMonths.Twelve;
    case 730:
      return AllowedStakingDurationMonths.TwentyFour;
    default:
      return AllowedStakingDurationMonths.Zero;
  }
};

function markToDurationMapping(value: number) {
  switch (value) {
    case 0:
      return 0;
    case 20:
      return 30;
    case 40:
      return 90;
    case 60:
      return 180;
    case 80:
      return 365;
    case 100:
      return 730;
    default:
      return 0;
  }
}

interface SelectedAccountData {
  index: number;
  lockDuration: number;
}

export const MergeAccounts = () => {
  const { publicKey: wallet } = useWallet();
  const { accounts } = useStakingAccounts();
  const { StakingStore, Lightbox } = useStore();
  const sendAndConfirm = useSendTransaction();

  const [selectedAccounts, setSelectedAccountsData] = useState<SelectedAccountData[]>([]);
  const [sliderMarks, setSliderMarks] = useState({});
  const [sliderMin, setSliderMin] = useState<number | null>(null);
  const [durationToMerge, setDurationToMerge] = useState<number>();

  const [sliderPosition, setSliderPosition] = useState(sliderMin || 0);

  const { index, lockDuration, amount } = StakingStore.accountToMerge;
  const lockedAccounts = accounts?.info?.stakingAccounts.locked.lockedStakingsData;
  const restOfLockedAccounts = lockedAccounts?.filter((acc) => acc.index !== index && acc.isActive);

  const handleMerge = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!wallet) throw new WalletNotConnectedError();
      const selectedAccountIndexes = selectedAccounts.map((acc) => acc.index);
      const tx = await mergeStakingAccounts(
        wallet,
        index,
        selectedAccountIndexes as number[],
        daysToLockDuration(durationToMerge as number),
      );

      await sendAndConfirm(tx, "confirmed", true);
    } catch (err) {
      console.log(err);
      errorCase(err);
    } finally {
      Lightbox.setVisible(false);
      Lightbox.setCanClose(true);
    }
  };

  const handleSelectedAccount = (index: number, lockDuration: number) => {
    setSelectedAccountsData((prevState) => {
      const selectedAccount = { index, lockDuration };

      const sameIndex = prevState.findIndex((acc) => acc.index === selectedAccount.index);
      let data;
      if (sameIndex === -1) {
        data = [...prevState, selectedAccount];
        return data;
      } else {
        data = prevState.filter((acc) => acc.index !== selectedAccount.index);
        return data;
      }
    });
  };

  const handleNewDuration = (value: number | number[]) => {
    if (typeof value !== "number") {
      value = value[0];
    }
    setSliderPosition(value);
    value = markToDurationMapping(value);
    setDurationToMerge(value);
  };

  const generateSliderMarks = () => {
    const accountDurations = selectedAccounts.map((acc) => acc.lockDuration);
    const minAvailableDuration = Math.max(lockDuration, ...accountDurations);
    const min = minLockDurationToDays(minAvailableDuration);

    const data = Object.keys(defaultSliderMarks).reduce((acc, step) => {
      if (defaultSliderMarks[step] > min || defaultSliderMarks[step].label >= min) {
        const field = { [step]: defaultSliderMarks[step] };
        return (acc = { ...acc, ...field });
      } else {
        return acc;
      }
    }, {});

    setSliderMarks(data);
  };

  const setSliderDefaultValue = () => {
    const minSliderValue = Number(Object.keys(sliderMarks)[0]);
    setSliderMin(minSliderValue);
    if (minSliderValue === 100) {
      setDurationToMerge(Number(sliderMarks[minSliderValue].label));
    } else {
      setDurationToMerge(Number(sliderMarks[minSliderValue]));
    }
  };

  useEffect(() => {
    setSliderDefaultValue();
  }, [sliderMarks]);

  useEffect(() => {
    generateSliderMarks();
  }, [selectedAccounts]);

  return (
    <div className="merge-stake">
      <h3 className="merge-stake__title">Merging accounts</h3>
      <div className="merge-stake__stats">
        <div className="merge-stake__stats-item">
          <p>Staked amount: </p>
          <p>
            {amount}
            <i className={`icon icon--sm icon--currency--UNLOC`} />
          </p>
        </div>
        <div className="merge-stake__stats-item">
          <p>Duration: </p> <p>{minLockDurationToDays(lockDuration)} days</p>
        </div>
      </div>
      <div className="list">
        <div className="list-to-merge">
          {restOfLockedAccounts?.map((acc) => {
            const indexes = new Set(selectedAccounts.map((acc) => acc.index));
            return (
              <StakingItem
                key={acc.index}
                onClick={handleSelectedAccount}
                accountData={acc}
                chosen={indexes.has(acc.index)}
              />
            );
          })}
        </div>
      </div>
      {selectedAccounts.length ? (
        sliderMin === 100 ? (
          <div className="merge-stake__stats">
            <div className="merge-stake__stats-item">
              <p className="slider-message">
                Staking accounts would be merged with 730 days duration
              </p>
            </div>
          </div>
        ) : (
          <Slider
            onChange={handleNewDuration}
            min={sliderMin as number}
            value={sliderPosition}
            max={100}
            defaultValue={sliderMin as number}
            marks={sliderMarks}
            step={null}
          />
        )
      ) : null}
      <button onClick={handleMerge} className="lb-collateral-button">
        Merge Accounts
      </button>
    </div>
  );
};

interface IProps {
  accountData: LockedStakingAccount;
  onClick: (index: number, lockDuration: number) => void;
  chosen: boolean;
}

const StakingItem = ({ onClick, accountData, chosen }: IProps) => {
  const amount = amountToUiAmount(
    accountData.stakingData.initialTokensStaked,
    UNLOC_MINT_DECIMALS,
  ).toLocaleString("en-us");

  const duration = accountData.stakingData.lockDuration;

  return (
    <div
      onClick={() => onClick(accountData.index, duration)}
      className={`merge-item ${chosen ? "active" : ""}`}>
      <div className="info">
        <p>Staked amount</p>
        <p>
          {amount} <i className={`icon icon--sm icon--currency--UNLOC`} />
        </p>
      </div>
      <div className="info">
        <p>Duration</p>
        <p>{minLockDurationToDays(duration)} days</p>
      </div>
    </div>
  );
};
