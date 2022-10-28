import { FormEvent, useEffect, useState } from "react";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  AllowedStakingDurationMonths,
  LockedStakingAccount,
  RelockType,
} from "@unloc-dev/unloc-sdk-staking";
import Slider from "rc-slider";

import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { useStore } from "@hooks/useStore";
import { amountToUiAmount } from "@utils/bignum";
import { mergeStakingAccounts, relockStakingAccount } from "@utils/spl/unloc-staking";
import { errorCase } from "@utils/toast-error-handler";

const defaultSliderMarks = {
  0: { label: "No lock", style: { left: "3%" } },
  20: "30",
  40: "90",
  60: "180",
  80: "365",
  100: { label: "730", style: { left: "97%" } },
};

const minLockDurationToDays = (minLockDuration: number): number => {
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

function markToDurationMapping(value: number): number {
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

interface StakingActionsProps {
  mode: "merge" | "relock";
}

export const StakingActions = ({ mode }: StakingActionsProps): JSX.Element => {
  const { publicKey: wallet } = useWallet();
  const { accounts } = useStakingAccounts();
  const { StakingStore, Lightbox } = useStore();
  const sendAndConfirm = useSendTransaction();

  const [selectedAccounts, setSelectedAccountsData] = useState<SelectedAccountData[]>([]);
  const [sliderMarks, setSliderMarks] = useState({});
  const [sliderMin, setSliderMin] = useState<number | null>(null);
  const [durationToMerge, setDurationToMerge] = useState<number>();

  const [sliderPosition, setSliderPosition] = useState(sliderMin ?? 0);

  const { index, lockDuration, amount } = StakingStore.accountToMerge;
  const lockedAccounts = accounts?.info?.stakingAccounts.locked.lockedStakingsData;
  const restOfLockedAccounts = lockedAccounts?.filter(
    (acc) => acc.index !== index && acc.indexInUse,
  );

  const actionButton = (): JSX.Element => {
    if (mode === "merge")
      return (
        <button onClick={handleMerge} className="lb-collateral-button">
          Merge Accounts
        </button>
      );
    else if (mode === "relock")
      return (
        <button onClick={handleRelock} className="lb-collateral-button">
          Relock Account
        </button>
      );
    else throw Error("Wrong action");
  };

  const handleMerge = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      if (wallet == null) throw new WalletNotConnectedError();
      const selectedAccountIndexes = selectedAccounts.map((acc) => acc.index);
      const tx = await mergeStakingAccounts(
        wallet,
        index,
        selectedAccountIndexes,
        daysToLockDuration(durationToMerge as number),
      );

      const { result } = await sendAndConfirm(tx, { skipPreflight: true });
      if (result.value.err) throw Error("Merging transaction failed");
    } catch (err) {
      console.log({ err });
      errorCase(err);
    } finally {
      Lightbox.setVisible(false);
      Lightbox.setCanClose(true);
    }
  };

  const handleRelock = async (): Promise<void> => {
    try {
      if (wallet == null) throw new WalletNotConnectedError();
      const tx = await relockStakingAccount(
        wallet,
        { relockType: RelockType.Flexi, index: 0 },
        daysToLockDuration(durationToMerge as number),
      );
      await sendAndConfirm(tx, { skipPreflight: true });
    } catch (err) {
      console.log(err);
      errorCase(err);
    } finally {
      Lightbox.setVisible(false);
      Lightbox.setCanClose(true);
    }
  };

  const handleSelectedAccount = (index: number, lockDuration: number): void => {
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

  const handleNewDuration = (value: number | number[]): void => {
    if (typeof value !== "number") value = value[0];

    setSliderPosition(value);
    value = markToDurationMapping(value);
    setDurationToMerge(value);
  };

  const generateSliderMarks = (): void => {
    const accountDurations = selectedAccounts.map((acc) => acc.lockDuration);
    const minAvailableDuration = Math.max(lockDuration, ...accountDurations);
    const min = minLockDurationToDays(minAvailableDuration);

    const data = Object.keys(defaultSliderMarks).reduce((acc, step) => {
      if (
        mode === "merge"
          ? defaultSliderMarks[step] > min || defaultSliderMarks[step].label >= min
          : defaultSliderMarks[step] >= min || defaultSliderMarks[step].label >= min
      ) {
        const field = { [step]: defaultSliderMarks[step] };
        return (acc = { ...acc, ...field });
      } else return acc;
    }, {});

    setSliderMarks(data);
  };

  const setSliderDefaultValue = (): void => {
    const minSliderValue = Number(Object.keys(sliderMarks)[0]);
    setSliderMin(minSliderValue);
    if (minSliderValue === 100) setDurationToMerge(Number(sliderMarks[minSliderValue].label));
    else setDurationToMerge(Number(sliderMarks[minSliderValue]));
  };

  useEffect(() => {
    setSliderDefaultValue();
  }, [sliderMarks]);

  useEffect(() => {
    generateSliderMarks();
  }, [selectedAccounts]);

  return (
    <div className="merge-stake">
      <h3 className="merge-stake__title">
        {mode === "merge" ? "Merging accounts" : mode === "relock" ? "Relock account" : ""}
      </h3>
      <div className="merge-stake__stats">
        <div className="merge-stake__stats-item">
          <p>Staked amount: </p>
          <p>
            {amount}
            <i className={"icon icon--sm icon--currency--UNLOC"} />
          </p>
        </div>
        <div className="merge-stake__stats-item">
          <p>Duration: </p> <p>{minLockDurationToDays(lockDuration)} days</p>
        </div>
      </div>
      {mode === "merge" && (
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
      )}
      {selectedAccounts.length > 0 || mode === "relock" ? (
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
      {actionButton()}
    </div>
  );
};

interface IProps {
  accountData: LockedStakingAccount;
  onClick: (index: number, lockDuration: number) => void;
  chosen: boolean;
}

const StakingItem = ({ onClick, accountData, chosen }: IProps): JSX.Element => {
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
          {amount} <i className={"icon icon--sm icon--currency--UNLOC"} />
        </p>
      </div>
      <div className="info">
        <p>Duration</p>
        <p>{minLockDurationToDays(duration)} days</p>
      </div>
    </div>
  );
};
