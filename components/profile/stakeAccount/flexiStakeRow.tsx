import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FlexiStakingAccount, WithdrawType } from "@unloc-dev/unloc-sdk-staking";
import { toast } from "react-toastify";
import { mutate } from "swr";

import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { GET_STAKING_ACCOUNTS_KEY } from "@hooks/useStakingAccounts";
import { useStore } from "@hooks/useStore";
import { amountToUiAmount } from "@utils/bignum";
import { withdrawTokens } from "@utils/spl/unloc-staking";
import { errorCase } from "@utils/toast-error-handler";

export const FlexiStakeRow = ({ stakingData }: FlexiStakingAccount): JSX.Element => {
  const { Lightbox } = useStore();
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
      const { result, signature } = await sendAndConfirm(tx);
      console.log(signature);
      if (result.value.err) throw Error("Failed to withdraw");

      void mutate([GET_STAKING_ACCOUNTS_KEY, wallet.toBase58()]);
      toast.success(`Withdrawed ${uiAmount.toLocaleString("en-us")} tokens.`);
    } catch (err) {
      console.log({ err });
      errorCase(err);
    }
  };

  const handleDeposit = async (): Promise<void> => {
    if (wallet == null) {
      toast.error("Connect your wallet");
      return;
    }

    Lightbox.setVisible(false);
    Lightbox.setContent("depositFlexi");
    Lightbox.setVisible(true);
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
          <button
            title="This will withdraw all the staked tokens"
            onClick={handleWithdraw}
            className="btn btn--md btn--primary">
            Withdraw
          </button>
        </div>
      </div>
    </li>
  );
};
