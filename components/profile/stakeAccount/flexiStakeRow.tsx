import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import {
  AllowedStakingDurationMonths,
  FlexiStakingAccount,
  RelockType,
  WithdrawType,
} from "@unloc-dev/unloc-sdk-staking";
import BN from "bn.js";

import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { amountToUiAmount } from "@utils/bignum";
import { depositTokens, relockStakingAccount, withdrawTokens } from "@utils/spl/unloc-staking";
import { errorCase } from "@utils/toast-error-handler";

export const FlexiStakeRow = ({ stakingData }: FlexiStakingAccount): JSX.Element => {
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();

  const uiAmount = amountToUiAmount(stakingData.initialTokensStaked, UNLOC_MINT_DECIMALS);
  const APY = 0.5;

  const handleWithdraw = async (): Promise<void> => {
    try {
      if (wallet == null) throw new WalletNotConnectedError();
      const tx = await withdrawTokens(connection, wallet, {
        withType: WithdrawType.Flexi,
        index: 0,
      });
      await sendAndConfirm(tx);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  const handleRelock = async (): Promise<void> => {
    try {
      if (wallet == null) throw new WalletNotConnectedError();
      const tx = await relockStakingAccount(
        wallet,
        { relockType: RelockType.Flexi, index: 0 },
        AllowedStakingDurationMonths.Zero,
      );
      await sendAndConfirm(tx);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };
  const handleDeposit = async (): Promise<void> => {
    try {
      if (wallet == null) throw new WalletNotConnectedError();
      const ix = await depositTokens(
        connection,
        wallet,
        new BN(10 ** 6),
        AllowedStakingDurationMonths.Zero,
      );
      const tx = new Transaction().add(...ix);
      await sendAndConfirm(tx);
    } catch (err) {
      console.log(err);
      errorCase(err);
    }
  };

  return (
    <li className="stakerow">
      <div className="stakerow__col--id--flexi">
        <div
          className="stakerow__id"
          style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}>
          Flexi
        </div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">Staked amount</div>
        <div className="stakerow__amount">
          {uiAmount.toLocaleString("en-us")}
          <i className={"icon icon--sm icon--currency--UNLOC"} />
        </div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">APY</div>
        <div className="stakerow__apr">{APY}%</div>
      </div>
      <div className="stakerow__col">
        <div className="stakerow__title">
          Status: <strong>FLEXI</strong>
        </div>
        <div className="stakerow__actions">
          <button onClick={handleDeposit} className="btn btn--md btn--primary">
            Deposit
          </button>
          <button onClick={handleRelock} className="btn btn--md btn--primary">
            Relock
          </button>
          <button onClick={handleWithdraw} className="btn btn--md btn--primary">
            Withdraw
          </button>
        </div>
      </div>
    </li>
  );
};
