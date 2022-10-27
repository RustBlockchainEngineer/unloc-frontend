import { useContext, useMemo, useState, useCallback } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Decorator, getIn } from "final-form";
import createDecorator from "final-form-calculate";
import { observer } from "mobx-react-lite";
import { Form, Field } from "react-final-form";

import { LoanDetails } from "@components/lightboxes/Loan/loanDetails";
import { formatOptions } from "@constants/config";
import { currencyMints } from "@constants/currency";
import { CurrencyTypes, USDC } from "@constants/currency-constants";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { getDecimalsForLoanAmount } from "@integration/getDecimalForLoanAmount";
import { StoreContext } from "@pages/_app";
import { calculateRepayValue, calculateApr, calculateInterest } from "@utils/loansMath";
import { updateLoanSubOffer } from "@utils/spl/unloc-loan";
import { getDurationFromContractData } from "@utils/timeUtils/timeUtils";
import { errorCase, successCase } from "@utils/toast-error-handler";

import { CircleProcessing } from "../circleProcessing";

import { SelectAdapter } from "./selectAdapter";
import { SliderAdapter } from "./sliderAdapter";
import { SwitchAdapter } from "./switchAdapter";

interface CreateLoanProps {
  mode: "new" | "update";
}
interface Values {
  token: CurrencyTypes;
  state: "apr_input" | "interest_input";
  amount: number;
  duration: number;
  apr: number;
  interest?: number;
  total?: string;
}

const getFormValues = (
  state: Object | undefined,
): { formState: string; amount: number; duration: number; apr: number; interest: number } => {
  const formState = getIn(state !== null ? (state as Object) : {}, "state");
  const amount = parseFloat(getIn(state !== null ? (state as Object) : {}, "amount"));
  const duration = parseFloat(getIn(state !== null ? (state as Object) : {}, "duration"));
  const apr = parseFloat(getIn(state !== null ? (state as Object) : {}, "apr"));
  const interest = parseFloat(getIn(state !== null ? (state as Object) : {}, "interest"));

  // This is safe, the state object and values should never be null
  return { formState, amount, duration, apr, interest };
};

export const CreateLoan = observer(({ mode }: CreateLoanProps) => {
  const store = useContext(StoreContext);
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();
  const { activeSubOffer, activeSubOfferData } = store.Lightbox;

  const [isDetails, setDetails] = useState(false);
  const [processing, setProcessing] = useState(false);

  const initialValues: Values =
    mode === "new"
      ? {
          token: USDC,
          amount: 1000,
          duration: 1,
          apr: 500,
          state: "apr_input",
        }
      : {
          token: currencyMints[activeSubOfferData.offerMint],
          amount: getDecimalsForLoanAmount(
            activeSubOfferData.offerAmount,
            activeSubOfferData.offerMint,
          ),
          duration: getDurationFromContractData(activeSubOfferData.loanDuration, "days"),
          apr: activeSubOfferData.aprNumerator,
          state: "apr_input",
        };

  const calculator = useMemo(
    () =>
      createDecorator(
        {
          field: ["amount", "duration"],
          updates: (_, __, allValues) => {
            const { formState, amount, apr, duration, interest } = getFormValues(allValues);
            if (formState === "apr_input")
              return {
                total: calculateRepayValue(amount, apr, duration, 100),
                interest: calculateInterest(amount, apr, duration, 100).toFixed(2),
              };
            else
              return {
                total: (amount + interest).toLocaleString("en-us", formatOptions),
                apr: calculateApr(amount, interest, duration, 100).toFixed(2),
              };
          },
        },
        {
          field: "apr",
          updates: (_, __, allValues) => {
            const { formState, amount, apr, duration } = getFormValues(allValues);
            if (formState === "apr_input")
              return {
                total: calculateRepayValue(amount, apr, duration, 100),
                interest: calculateInterest(amount, apr, duration, 100).toFixed(2),
              };
            else return {};
          },
        },
        {
          field: "interest",
          updates: (_, __, allValues) => {
            const { formState, amount, duration, interest } = getFormValues(allValues);
            if (formState === "interest_input")
              return {
                total: (amount + interest).toLocaleString("en-us", formatOptions),
                apr: calculateApr(amount, interest, duration, 100).toFixed(2),
              };
            else return {};
          },
        },
      ) as Decorator<Values, object>,
    [],
  );

  const onSubmit = async (values: Values): Promise<void> => {
    if (!connection || wallet == null) throw Error("Connect your wallet");

    const { amount, duration, apr, token, total } = values;

    if (mode === "new")
      try {
        if (store.Lightbox.content === "loanCreate" && store.MyOffers.activeNftMint) {
          store.Lightbox.setVisible(false);
          setProcessing(true);

          store.MyOffers.setPreparedOfferData({
            nftMint: store.MyOffers.activeNftMint,
            amount: Number(amount),
            duration: Number(duration),
            APR: Number(apr),
            currency: token,
            repayValue: total ?? "0.00",
          });

          store.Lightbox.setContent("loanConfirm");
          store.Lightbox.setVisible(true);
        }
      } catch (e: any) {
        errorCase(e);
      }
    else if (mode === "update") {
      store.Lightbox.setCanClose(false);
      setProcessing(true);
      try {
        const subOffer = new PublicKey(activeSubOffer);
        const tx = await updateLoanSubOffer(
          connection,
          wallet,
          new BN(amount),
          new BN(duration),
          new BN(apr),
          subOffer,
        );
        await sendAndConfirm(tx);

        setProcessing(false);
        successCase("Changes Saved");
      } catch (e: any) {
        errorCase(e);
      } finally {
        store.Lightbox.setVisible(false);
        store.Lightbox.setCanClose(true);
        await store.MyOffers.refetchStoreData();
      }
    }
  };

  const showDetailsHahdler = useCallback(() => {
    setDetails((prevState) => {
      store.Lightbox.setAdditionalInfoOpened(!prevState);
      return !prevState;
    });
  }, []);

  return processing ? (
    <div className="create-offer-processing">
      <CircleProcessing />
    </div>
  ) : (
    <Form<Values>
      className="create-offer-container"
      decorators={[calculator]}
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, values }) => (
        <form className="create-offer" onSubmit={handleSubmit}>
          <h1>{mode === "new" ? "Create a Loan Offer" : "Update Loan Offer"}</h1>
          <div className="offer-form">
            <div className="form-line form-amount">
              <div>
                <span>Amount</span>
                <Field<number>
                  name="amount"
                  component="input"
                  type="number"
                  step={0.01}
                  min={0.1}
                  placeholder="Amount"
                  className="input-text"
                />
              </div>
              <div>
                <span>Currency</span>
                <Field<string>
                  name="token"
                  classNames="loan-currency"
                  disabled={mode === "update"}
                  component={SelectAdapter}
                />
              </div>
            </div>
            <div className="form-line form-duration">
              <div>
                <span>Duration (Days)</span>
                <Field<number>
                  name="duration"
                  min={1}
                  max={90}
                  step={1}
                  component={SliderAdapter}
                />
              </div>
              <div>
                <span></span>
                <Field<number>
                  component="input"
                  name="duration"
                  type="number"
                  min={1}
                  max={90}
                  className="input-text"
                />
              </div>
            </div>
            <div className="form-line form-APR row-division">
              <div>
                <span>APR (%)</span>
                <Field name="state" component={SwitchAdapter} />
                <span>Interest</span>
              </div>
              <div>
                <Field<number>
                  name="apr"
                  type="number"
                  component="input"
                  step={0.01}
                  min={1}
                  className={`input-text ${values.state === "apr_input" ? "" : "disabled"}`}
                  disabled={values.state !== "apr_input"}
                />
                <Field<number>
                  name="interest"
                  type="number"
                  component="input"
                  className={`input-text ${values.state === "interest_input" ? "" : "disabled"}`}
                  disabled={values.state !== "interest_input"}
                />
              </div>
            </div>
            <div className="form-line rewards row-division">
              <span>Current Unloc rewards for this collection</span>
              <p>
                APR:
                <b>12.5%</b>
                <i className="icon icon--svs icon--unloc--light" />
              </p>
            </div>
            <div className="form-line form-repaid">
              <div>
                <h3 className="title">Total Repay Amount</h3>
                <p className="amount">
                  {values?.total}
                  <span>{values?.token}</span>
                </p>
              </div>
            </div>
            <div className="actions">
              <button type="submit" className="btn btn--md btn--primary" disabled={submitting}>
                {mode === "new" ? "Create" : "Save Changes"}
              </button>
              <button
                type="button"
                className="btn btn--md btn--bordered"
                onClick={showDetailsHahdler}>
                Show details
                <i className={`icon icon--${isDetails ? "caret-tin" : "dash"}`} />
              </button>
            </div>
          </div>
          {isDetails && <LoanDetails isDetails={isDetails} />}
        </form>
      )}
    />
  );
});
