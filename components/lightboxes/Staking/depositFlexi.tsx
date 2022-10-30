// Used when depositing additional tokens into

import { ChangeEvent, useState } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { AllowedStakingDurationMonths } from "@unloc-dev/unloc-sdk-staking";
import { toast } from "react-toastify";

import { formatOptions } from "@constants/config";
import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { useStakingAccounts } from "@hooks/useStakingAccounts";
import { useStore } from "@hooks/useStore";
import { amountToUiAmount } from "@utils/bignum";
import { uiAmountToAmount } from "@utils/spl/common";
import { depositTokens } from "@utils/spl/unloc-staking";
import { errorCase } from "@utils/toast-error-handler";

// an existing flexi staking account
export const DepositFlexi = () => {
  const { Lightbox, Wallet } = useStore();
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { accounts, mutate } = useStakingAccounts();
  const sendAndConfirm = useSendTransaction();

  const [uiAmount, setUiAmount] = useState("");

  const flexiStake = accounts?.info?.stakingAccounts.flexi.stakingData.initialTokensStaked;

  const handleAmountInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Check for numbers
    if (!value || value.match(/^\d{1,}(\.\d{0,6})?$/) != null) setUiAmount(value);
  };

  const handleAmountPercent = (amount: number) => () => {
    const percentsToAmount = Wallet.unlocAmount / (100 / amount);
    setUiAmount(percentsToAmount.toString());
    // StakingsetCreateFormInput("uiAmount", percentsToAmount.toString());
  };

  const handleDeposit = async () => {
    if (wallet === null) {
      toast.error("Connect your wallet");
      return;
    }

    try {
      Lightbox.setContent("circleProcessing");
      Lightbox.setCanClose(false);
      Lightbox.setVisible(true);

      const amount = uiAmountToAmount(uiAmount, UNLOC_MINT_DECIMALS);
      const ix = await depositTokens(connection, wallet, amount, AllowedStakingDurationMonths.Zero);
      const tx = new Transaction().add(...ix);

      const { result } = await sendAndConfirm(tx);
      if (result.value.err) throw Error("Depositing failed.");

      toast.success(`Successfully deposited ${uiAmount} tokens!`);
      void mutate();
    } catch (error) {
      console.log({ error });
      errorCase(error);
    } finally {
      Lightbox.setCanClose(true);
      Lightbox.setVisible(false);
    }
  };

  return (
    <div className="create-stake">
      <h3 className="create-stake__title">Deposit to flexi staking</h3>
      <div className="create-stake__stats">
        <div className="create-stake__stats-item">
          Staked{" "}
          {flexiStake ? (
            <strong>
              {amountToUiAmount(flexiStake, UNLOC_MINT_DECIMALS).toLocaleString(
                "en-us",
                formatOptions,
              )}
            </strong>
          ) : (
            <strong>0</strong>
          )}
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
          {[25, 50, 75, 100].map((amount) => {
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

      <form onSubmit={handleDeposit} className="create-stake__form">
        <div className="create-stake__amount row-division">
          <label htmlFor="amount">Custom Amount</label>
          <input
            lang="en"
            value={uiAmount || 0}
            onChange={handleAmountInput}
            placeholder=""
            name="amount"
            type="number"
          />
        </div>

        <button type="submit" className="confirm btn btn--md btn--primary">
          Deposit
        </button>
      </form>
    </div>
  );
};
