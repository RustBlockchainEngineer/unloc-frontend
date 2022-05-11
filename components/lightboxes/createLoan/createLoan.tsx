import React, { useContext, useRef, useState, useEffect, FormEvent } from "react";
import { observer } from "mobx-react";
import { toast } from "react-toastify";
import { Form, Field } from "react-final-form";
import { StoreContext } from "@pages/_app";
import { SubOfferInterface } from "@stores/LoanActionStore";
import { calculateRepayValue, formatRepayValue } from "@utils/calculateRepayValue";
import { BlobLoader } from "@components/layout/blobLoader";
import { getDecimalsForLoanAmount } from "@integration/getDecimalForLoanAmount";
import { currencyMints } from "@constants/currency";
import { calculateAprFromRepayValue } from "@utils/calculateAprFromRepayValue";
import { SwitchButton } from "@components/layout/switchButton";
import { calculateAprFromTotalRepayAndApr } from "@utils/calculateAmountFromTotalRepayAndApr";
import { CustomSelect } from "@components/layout/customSelect";
import { getDurationFromContractData } from "@utils/timeUtils/timeUtils";

interface CreateLoanProps {
  mode: "new" | "update";
}

export const CreateLoan: React.FC<CreateLoanProps> = observer(({ mode }) => {
  const store = useContext(StoreContext);
  const { connected, wallet, walletKey } = store.Wallet;
  const { activeSubOffer, activeSubOfferData } = store.Lightbox;

  const [processing, setProcessing] = useState(false);
  const [repayValue, setRepayValue] = useState(
    mode === "update"
      ? calculateRepayValue(
          getDecimalsForLoanAmount(activeSubOfferData.offerAmount, activeSubOfferData.offerMint),
          activeSubOfferData.aprNumerator,
          getDurationFromContractData(activeSubOfferData.loanDuration, "days"),
          store.GlobalState.denominator,
        )
      : "0.00",
  );

  const [interestMode, setInterestMode] = useState(false);
  const [currency, setCurrency] = useState<string>(
    mode === "update" ? currencyMints[activeSubOfferData.offerMint] : "USDC",
  );

  const amountRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const aprRef = useRef<HTMLInputElement>(null);
  const accruedRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (_values: SubOfferInterface) => {
    if (connected && wallet && walletKey) {
      if (!(amountRef.current && durationRef.current && aprRef.current && accruedRef.current)) {
        return;
      }

      const amount = Number(amountRef.current.value);
      const duration = Number(durationRef.current.value);
      let apr, accrued;

      if (Number(aprRef.current.value) === 0) {
        accrued = Number(accruedRef.current.value);
        apr = calculateAprFromRepayValue(
          amount,
          amount + accrued,
          duration,
          store.GlobalState.denominator,
        );
      } else {
        apr = Number(aprRef.current.value);
        accrued = +(amount * ((apr / 36500) * duration)).toFixed(4);
      }

      if (mode === "new") {
        try {
          if (store.Lightbox.content === "loanCreate" && store.MyOffers.activeNftMint) {
            store.Lightbox.setCanClose(false);
            setProcessing(true);

            await store.MyOffers.handleCreateSubOffer(
              store.MyOffers.activeNftMint,
              Number(amount),
              Number(duration),
              Number(apr),
              currency,
            );
            store.Lightbox.setVisible(false);
            store.Lightbox.setCanClose(true);
            setProcessing(false);
            toast.success(`Loan Offer Created`, {
              autoClose: 3000,
              position: "top-center",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        } catch (e: any) {
          if (e.message === "User rejected the request.") {
            toast.error(`Transaction rejected`, {
              autoClose: 3000,
              position: "top-center",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else if ((e as Error).message.includes("503 Service Unavailable")) {
            toast.error("Solana RPC currently unavailable, please try again in a moment", {
              autoClose: 3000,
              position: "top-center",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else {
            toast.error(`Something went wrong`, {
              autoClose: 3000,
              position: "top-center",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
          console.log(e);
        } finally {
          store.Lightbox.setVisible(false);
          store.Lightbox.setCanClose(true);
          await store.MyOffers.refetchStoreData();
        }
      } else if (mode === "update") {
        store.Lightbox.setCanClose(false);
        setProcessing(true);
        try {
          await store.MyOffers.handleEditSubOffer(
            Number(amount),
            Number(duration),
            Number(apr),
            Number(activeSubOfferData.minRepaidNumerator),
            activeSubOffer,
          );
          setProcessing(false);
          toast.success(`Changes Saved`, {
            autoClose: 3000,
            position: "top-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } catch (e: any) {
          if (e.message === "User rejected the request.") {
            toast.error(`Transaction rejected`, {
              autoClose: 3000,
              position: "top-center",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else if ((e as Error).message.includes("503 Service Unavailable")) {
            toast.error("Solana RPC currently unavailable, please try again in a moment", {
              autoClose: 3000,
              position: "top-center",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else {
            toast.error(`Something went wrong`, {
              autoClose: 3000,
              position: "top-center",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
          console.log(e);
        } finally {
          store.Lightbox.setVisible(false);
          store.Lightbox.setCanClose(true);
          await store.MyOffers.refetchStoreData();
        }
      }
    }
  };

  const handleInterestModeChange = () => {
    if (!(accruedRef.current && amountRef.current && durationRef.current && aprRef.current)) {
      return;
    }

    setInterestMode(!interestMode);

    const accrued = Number(accruedRef.current.value);
    const amount = Number(amountRef.current.value);
    const duration = Number(durationRef.current.value);
    const apr = Number(aprRef.current.value);

    if (interestMode) {
      aprRef.current.value = calculateAprFromRepayValue(
        amount,
        amount + accrued,
        duration,
        store.GlobalState.denominator,
      );
    } else {
      accruedRef.current.value = (
        (amount * apr * duration) /
        (365 * (store.GlobalState.denominator / 100))
      ).toFixed(4);
    }
  };

  const onValueInput = (e: FormEvent<HTMLInputElement>) => {
    if (!(accruedRef.current && amountRef.current && durationRef.current && aprRef.current)) {
      return;
    }

    const name = (e.target as HTMLInputElement).name;

    const amount = Number(amountRef.current.value);
    const duration = Number(
      name === "duration" ? (e.target as HTMLInputElement).value : durationRef.current.value,
    );

    if (name === "duration") {
      durationRef.current.value = duration.toString();
    }

    if (interestMode) {
      const accrued = Number(accruedRef.current.value);
      aprRef.current.value = calculateAprFromRepayValue(
        amount,
        amount + accrued,
        duration,
        store.GlobalState.denominator,
      );
      setRepayValue(formatRepayValue(amount, accrued));
    } else {
      const apr = Number(aprRef.current.value);
      accruedRef.current.value = (amount * ((apr / 36500) * duration)).toFixed(4);
      setRepayValue(calculateRepayValue(amount, apr, duration, store.GlobalState.denominator));
    }
  };

  const onInterestInput = (e: FormEvent<HTMLInputElement>) => {
    if (!(accruedRef.current && amountRef.current && durationRef.current && aprRef.current)) {
      return;
    }

    const accrued = Number(accruedRef.current.value);
    const amount = Number(amountRef.current.value);
    const duration = Number(durationRef.current.value);

    const apr = calculateAprFromRepayValue(
      amount,
      amount + accrued,
      duration,
      store.GlobalState.denominator,
    );

    aprRef.current.value = apr;
    setRepayValue(
      calculateRepayValue(amount, parseFloat(apr), duration, store.GlobalState.denominator),
    );
  };

  const onAprInput = (e: FormEvent<HTMLInputElement>) => {
    if (!(accruedRef.current && amountRef.current && durationRef.current && aprRef.current)) {
      return;
    }

    const apr = Number(aprRef.current.value);
    const amount = Number(amountRef.current.value);
    const duration = Number(durationRef.current.value);

    accruedRef.current.value = (
      (amount * apr * duration) /
      (365 * (store.GlobalState.denominator / 100))
    ).toFixed(4);
    setRepayValue(calculateRepayValue(amount, apr, duration, store.GlobalState.denominator));
  };

  const getInitialValueOnUpdate = () => {
    if (activeSubOfferData) {
      return getDecimalsForLoanAmount(activeSubOfferData.offerAmount, activeSubOfferData.offerMint);
    }
  };

  return processing ? (
    <div className="create-offer-processing">
      <BlobLoader />
      <span>Processing Transaction</span>
    </div>
  ) : (
    <Form
      className="create-offer-container"
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, pristine, values }) => (
        <form className="create-offer" onSubmit={handleSubmit}>
          <h1>{mode === "new" ? `Create a Loan Offer` : `Update Loan Offer`}</h1>
          <div className="offer-form">
            <div className="form-line form-amount">
              <div>
                <span>Amount</span>
                <Field
                  component="input"
                  ref={amountRef}
                  onInput={onValueInput}
                  type="number"
                  name="loanvalue"
                  step={currency.toUpperCase() == "USDC" ? "0.01" : "0.001"}
                  min={currency.toUpperCase() == "USDC" ? 0.1 : 0.01}
                  placeholder="Amount"
                  className="input-text"
                  initialValue={
                    mode === "update"
                      ? getInitialValueOnUpdate()
                      : currency.toUpperCase() === "USDC"
                      ? 1000
                      : 10
                  }
                />
              </div>
              <div>
                <span>Currency</span>
                <CustomSelect
                  options={["USDC", "SOL"]}
                  selectedOption={
                    mode === "update" && activeSubOfferData
                      ? currencyMints[activeSubOfferData.offerMint]
                      : currency
                  }
                  setSelectedOption={setCurrency}
                  classNames="loan-currency"
                  disabled={mode === "update"}
                />
              </div>
            </div>
            <div className="form-line form-duration">
              <div>
                <span>Duration (Days)</span>
                <Field
                  onInput={onValueInput}
                  component="input"
                  name="duration"
                  type="range"
                  min={1}
                  max={90}
                  initialValue={
                    mode === "update" && activeSubOfferData
                      ? activeSubOfferData.loanDuration / (3600 * 24)
                      : 1
                  }
                />
              </div>
              <div>
                <span></span>
                <Field
                  ref={durationRef}
                  onInput={onValueInput}
                  component="input"
                  name="duration"
                  type="number"
                  min={1}
                  max={90}
                  className="input-text"
                  initialValue={
                    mode === "update" && activeSubOfferData
                      ? activeSubOfferData.loanDuration / (3600 * 24)
                      : 1
                  }
                />
              </div>
            </div>
            <div className="form-line form-APR">
              <div>
                <span>APR (%)</span>
                <input
                  ref={aprRef}
                  onInput={onAprInput}
                  type="number"
                  name="apr"
                  step={0.01}
                  min={0.01}
                  defaultValue={
                    !interestMode
                      ? mode === "update" && activeSubOfferData
                        ? activeSubOfferData.aprNumerator
                        : 500
                      : ""
                  }
                  className={`input-text ${interestMode ? "disabled" : ""}`}
                  disabled={interestMode}
                />
              </div>
              <SwitchButton state={!interestMode} onClick={() => handleInterestModeChange()} />
              <div>
                <span>Interest</span>
                <input
                  ref={accruedRef}
                  onInput={onInterestInput}
                  type="number"
                  name="interest"
                  step={0.000001}
                  min={0.000001}
                  defaultValue={
                    interestMode
                      ? mode === "update" && activeSubOfferData
                        ? (activeSubOfferData.offerAmount *
                            activeSubOfferData.aprNumerator *
                            activeSubOfferData.loanDuration) /
                          (3600 * 24 * 365 * (store.GlobalState.denominator / 100))
                        : 1
                      : ""
                  }
                  className={`input-text ${interestMode ? "" : "disabled"}`}
                  disabled={!interestMode}
                />
              </div>
            </div>
            <div className="form-line form-repaid">
              <div>
                <h3 className="title">Total Repay Amount</h3>
                <p className="amount">
                  {repayValue}
                  <span>{currency.toUpperCase()}</span>
                </p>
              </div>
            </div>
            <button type="submit" className="btn-content" disabled={submitting || pristine}>
              <i className="icon icon--nft" />
              {mode === "new" ? `Create` : `Save Changes`}
            </button>
          </div>
        </form>
      )}
    />
  );
});
