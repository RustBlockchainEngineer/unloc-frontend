import type { bignum } from "@metaplex-foundation/beet";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FlexiStakingAccount, NumDenPair, WithdrawType } from "@unloc-dev/unloc-sdk-staking";
import BN from "bn.js";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { mutate } from "swr";

import { CircleLoader } from "@components/layout/circleLoader";
import { UNLOC_MINT_DECIMALS } from "@constants/currency-constants";
import { usePoolInfo } from "@hooks/usePoolInfo";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { GET_STAKING_ACCOUNTS_KEY } from "@hooks/useStakingAccounts";
import { useStore } from "@hooks/useStore";
import { amountToUiAmount, numVal, val } from "@utils/bignum";
import { withdrawTokens } from "@utils/spl/unloc-staking";
import { errorCase } from "@utils/toast-error-handler";

export const FlexiStakeRow = ({ stakingData }: FlexiStakingAccount): JSX.Element => {
  const { Lightbox, GlobalState } = useStore();
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const { data: poolData } = usePoolInfo();
  const sendAndConfirm = useSendTransaction();

  if (!poolData)
    return (
      <div className="tw-w-full tw-mx-auto tw-flex tw-justify-center">
        <CircleLoader size="large" />
      </div>
    );

  const uiAmount = amountToUiAmount(stakingData.initialTokensStaked, UNLOC_MINT_DECIMALS);
  const duration = dayjs
    .duration(GlobalState.currentTime - numVal(stakingData.accountLastUpdatedAt), "s")
    .asDays();
  const uiEarned = calculateTotalEarnings(uiAmount, duration, poolData.interestRateFraction.flexi);
  const uiDiff = uiEarned - uiAmount;

  // Has the user earned anything yet?
  const inPlus = typeof uiDiff === "number" && uiDiff > 0;

  const APY = divideBnToNumber(
    val(poolData.interestRateFraction.flexi.numerator),
    val(poolData.interestRateFraction.flexi.denominator),
  );

  const handleWithdraw = async (): Promise<void> => {
    try {
      if (wallet == null) throw new WalletNotConnectedError();

      const duration = dayjs
        .duration(GlobalState.currentTime - numVal(stakingData.accountLastUpdatedAt), "s")
        .asDays();
      console.log(duration);

      const tx = await withdrawTokens(connection, wallet, {
        withType: WithdrawType.Flexi,
        index: 0,
      });
      const { result } = await sendAndConfirm(tx);
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
    <li className="mx-auto dark:tw-bg-[#482687] tw-bg-[#b4ace2] tw-flex tw-transition-colors tw-duration-75 sm:tw-rounded-md tw-min-h-[140px]">
      {/* Flexi identifier */}
      <div className="tw-border-[#6743aa] tw-border-solid tw-min-w-[48px] tw-border-0 tw-border-r tw-px-2 tw-hidden sm:tw-flex tw-items-center tw-flex-initial">
        <div
          style={{ writingMode: "vertical-lr" }}
          className="transform tw-rotate-180 tw-font-bold tw-text-[#a07ce4] tw-text-2xl">
          Flexi
        </div>
      </div>

      {/* Flexi row info - grid */}
      <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-12 tw-divide-y sm:tw-divide-x sm:tw-divide-y-0 tw-divide-[#6743aa] tw-flex-1">
        <div className="tw-px-4 tw-pt-4 tw-pb-2 sm:tw-col-span-4">
          <dl className="tw-flex tw-flex-row tw-justify-around">
            <div>
              <dd className="tw-uppercase tw-text-xs tw-flex tw-items-center tw-gap-x-2">
                Staked amount
                <i className={"icon icon--tn icon--currency--UNLOC"} />
              </dd>
              <dt className="tw-font-bold tw-text-2xl tw-flex tw-items-center tw-justify-center sm:tw-mt-6">
                {uiAmount.toLocaleString("en-us", { maximumFractionDigits: 3 })}
                <i className={"icon icon--sm icon--currency--UNLOC"} />
              </dt>
            </div>
            <div className="tw-flex tw-flex-col sm:tw-gap-y-6 tw-items-center">
              <dd className="tw-uppercase tw-text-xs tw-gap-x-2 tw-flex tw-items-center">
                Balance
                <div className="tw-flex-shrink-0">
                  <i className={"icon icon--tn icon--currency--UNLOC"} />
                </div>
              </dd>
              <dt className={`tw-font-bold tw-text-2xl ${inPlus ? "tw-text-[#00d756]" : ""}`}>
                {uiEarned.toLocaleString("en-us", { maximumFractionDigits: 3 })}
              </dt>
              {inPlus && (
                <div
                  className={`${
                    inPlus ? "tw-text-[#00d756]" : ""
                  } tw-flex tw-items-center tw-gap-x-1`}>
                  <i className="icon icon--svs rise-reward" /> +
                  {uiDiff.toLocaleString("en-us", { maximumFractionDigits: 3 })}
                </div>
              )}
            </div>
          </dl>
        </div>
        <div className="tw-px-6 tw-pt-4 tw-pb-2 sm:tw-col-span-2">
          <dd className="tw-uppercase tw-text-xs tw-text-center">APY</dd>
          <dt className="tw-font-bold tw-text-xl tw-mt-3 sm:tw-mt-6 tw-text-center">
            {APY * 100}%
          </dt>
        </div>
        <div className="tw-px-10 tw-border-t tw-border-[#6743aa] sm:tw-border-t-0 tw-pt-4 tw-pb-2 sm:tw-col-span-6 tw-flex tw-flex-col tw-items-center tw-gap-x-4">
          <div className="tw-uppercase tw-text-xs tw-mx-auto">
            Status: <span className="tw-font-bold">FLEXI</span>
          </div>
          <div className="tw-flex tw-justify-between tw-gap-x-6 tw-mt-3 sm:tw-mt-6 tw-w-full">
            <button
              onClick={handleDeposit}
              className="tw-inline-flex tw-flex-1 tw-text-white tw-bg-[#e00a7f] tw-border tw-border-transparent hover:tw-bg-[#ad1468] tw-justify-center tw-items-center tw-px-6 tw-py-2 tw-rounded-md hover:tw-cursor-pointer">
              Deposit
            </button>
            <button
              title="This will withdraw all the staked tokens"
              onClick={handleWithdraw}
              className="tw-inline-flex tw-flex-1 tw-text-white tw-justify-center tw-bg-[#e00a7f] tw-border tw-border-transparent hover:tw-bg-[#ad1468] tw-items-center tw-px-6 tw-py-2 tw-rounded-md hover:tw-cursor-pointer">
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

function calculateTotalEarnings(
  initialStaked: bignum,
  durationInDays: number,
  aprFraction: NumDenPair,
) {
  const apr = divideBnToNumber(val(aprFraction.numerator), val(aprFraction.denominator));
  const compoundings = Math.floor(durationInDays);
  const factor = Math.pow(apr + 1, compoundings);
  return numVal(initialStaked) * factor;
}

function divideBnToNumber(numerator: BN, denominator: BN): number {
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}
