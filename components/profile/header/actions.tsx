import { useSendTransaction } from "@hooks/useSendTransaction";
import { StoreContext } from "@pages/_app";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AllowedStakingDurationMonths, WithdrawType } from "@unloc-dev/unloc-sdk-staking";
import {
  depositTokens,
  mergeStakingAccounts,
  reallocUserAccount,
  withdrawTokens,
} from "@utils/spl/unloc-staking";
import BN from "bn.js";
import { observer } from "mobx-react-lite";
import { useContext } from "react";

export const StakeActions = observer(() => {
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { Lightbox, StakingStore } = useContext(StoreContext);
  const sendAndConfirm = useSendTransaction();
  const handleNewStake = () => {
    Lightbox.setVisible(false);
    // Reset the inputs
    StakingStore.resetCreateFormInputs();
    Lightbox.setContent("createStake");
    Lightbox.setVisible(true);
  };

  const handleClaimRewards = async () => {
    // Temporary
    // const info = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
    // if (!info) return;
    // const unixTime = info.data.readBigInt64LE(8 * 4);
    // console.log("Now ", unixTime.toString());
    // console.log("Now ", dayjs(Number(unixTime) * 1000).format("DD/MM/YYYY"));

    if (!wallet) throw new WalletNotConnectedError();
    const tx = await withdrawTokens(connection, wallet, {
      withType: WithdrawType.LiqMining,
      index: 0,
    });
    await sendAndConfirm(tx, "confirmed", true);
  };
  const handleReallocUserAccount = async () => {
    if (!wallet) throw new WalletNotConnectedError();

    const tx = await reallocUserAccount(wallet);
    await sendAndConfirm(tx, "confirmed", true);
  };
  const handleMergeAccounts = async () => {
    if (!wallet) throw new WalletNotConnectedError();

    // this two depositToken actions are test-purpose. should be deleted
    const testTx1 = await depositTokens(
      connection,
      wallet,
      new BN(10 ** 6),
      AllowedStakingDurationMonths.One,
    );
    await sendAndConfirm(testTx1, "confirmed", true);
    const testTx2 = await depositTokens(
      connection,
      wallet,
      new BN(10 ** 6),
      AllowedStakingDurationMonths.Three,
    );
    await sendAndConfirm(testTx2, "confirmed", true);

    const tx = await mergeStakingAccounts(wallet, 0, 1, AllowedStakingDurationMonths.One);
    await sendAndConfirm(tx, "confirmed", true);
  };

  return (
    <article className="stake__actions col">
      <div className="stake__plus">
        <span className="title">New staking account</span>
        <div className="add-new">
          <button type="button" className="button--plus" onClick={handleNewStake}>
            &#43;
          </button>
        </div>
      </div>
      <div className="separator" />
      <div className="stake__buttons">
        <button onClick={handleReallocUserAccount} className="btn btn--md btn--primary">
          Level Up
        </button>
        <button onClick={handleMergeAccounts} className="btn btn--md btn--primary">
          Merge Accounts
        </button>
        <button onClick={handleClaimRewards} className="btn btn--md btn--bordered">
          Claim Rewards
        </button>
      </div>
    </article>
  );
});
