import { useMemo, useState } from "react";

import { observer } from "mobx-react-lite";

import { SliderAdapter } from "./Loan/sliderAdapter";
import { Form, Field } from "react-final-form";
import { createForm } from "final-form";
import createDecorator from "final-form-calculate";

export const Vote = observer(() => {
  // const { setVote } = store.Lightbox;
  // const { amount, duration, APR, totalRepay, currency, offerPublicKey } = acceptOfferData;
  const totalSum = 10000;
  const initialValues = { SMB: 2000, DAA: 2000, DeGods: 2000, DT: 1500, SolGods: 2500 };
  const [nextVoteValues] = useState<any>(initialValues);

  // these are used for realtime updates of sliders
  let currentValues: any = initialValues;
  let startedValues: any = initialValues;
  let startedName: string = "";

  const handleVote = async (values: any): Promise<void> => {
    let alertMsg = "";
    let sum = 0;
    console.log(values);

    Object.keys(values).forEach((key) => {
      alertMsg += key + " " + values[key] / 100 + "\n";
      sum += values[key] / 100;
    });

    alert(alertMsg + sum);
    // try {
    //   store.Lightbox.setContent("processing");
    //   store.Lightbox.setCanClose(false);
    //   store.Lightbox.setVisible(true);
    //   //await store.Offers.setVote(offerPublicKey);
    //   successCase("Loan Accepted");
    // } catch (e: any) {
    //   errorCase(e);
    // } finally {
    //   store.Lightbox.setCanClose(true);
    //   store.Lightbox.setVisible(false);
    // }
  };

  const [memoForm] = useMemo(() => {
    const form = createForm({
      onSubmit: handleVote,
      initialValues,
    });

    const balancer = createDecorator<typeof initialValues>({
      field: Object.keys(nextVoteValues),
      updates: (value, name, allValues, prevValues) => {
        // If our field is not active, it means it was not changed by the user.
        // Return without changes, because if we change here we will get infinite recursion.
        // @ts-ignore
        if (
          !allValues ||
          !prevValues ||
          allValues === prevValues ||
          currentValues[name] === value
        ) {
          return {};
        }
        if (startedName != name) {
          startedName = name;
          startedValues = allValues;
        }
        // Omit the field that has been changed by the user
        // @ts-ignore
        const { [name]: ommited, ...curRest } = allValues;
        // @ts-ignore
        const { [name]: startedOmmited, ...rest } = startedValues;
        // total difference to add with rest fields
        const totalRest = totalSum - ommited;
        let totalPrevRest = 0;
        let restLen = Object.keys(rest).length;
        Object.keys(rest).forEach((key) => {
          totalPrevRest += rest[key];
        });
        // if prev status is 100 0 0 ... , all rest fields need to be updated.
        // delta sum is for calculation difference.
        let remainedRest = totalRest;
        let remainedPrevRest = totalPrevRest;
        let updatedCount = 0;
        Object.keys(rest).forEach((key) => {
          if (rest[key] == 0 && totalPrevRest > 0) return;
          let delta = 0;
          if (totalPrevRest == 0) {
            delta = Math.floor(remainedRest / (restLen - updatedCount));
          } else {
            delta = Math.floor(
              remainedPrevRest > rest[key]
                ? (remainedRest * rest[key]) / remainedPrevRest
                : remainedRest,
            );
          }

          remainedPrevRest -= rest[key];
          rest[key] = delta;
          remainedRest -= delta;
          updatedCount++;
        });

        currentValues = { [name]: ommited, ...rest };

        Object.keys(currentValues).forEach((key) => {
          if (currentValues[key] == 0 && startedValues[key] > 0) {
            startedValues = currentValues;
          }
        });
        return rest;
      },
    });

    const unsubscribe = balancer(form);
    return [form, unsubscribe] as const;
  }, []);

  return (
    <div className="vote-lightbox">
      <h2>Vote for collection</h2>
      <div className="vote-lightbox__form">
        <div className="vote-lightbox__form">
          <Form
            className="create-offer-container"
            onSubmit={handleVote}
            form={memoForm}
            render={({ handleSubmit, submitting, values }) => (
              <form onSubmit={handleSubmit}>
                {Object.keys(initialValues).map(function (key) {
                  return (
                    <div key={key} className="input-row">
                      <div className="input-row__title">{key}</div>
                      <Field<number>
                        name={key}
                        min={0}
                        max={10000}
                        // step={1}
                        component={SliderAdapter}
                      />
                      <div className="input-row__value">{values[key] / 100 + "%"}</div>
                    </div>
                  );
                })}
                <div>
                  Total: {Object.keys(values).reduce((acc, key) => (acc += values[key]), 0) / 100}
                </div>
                <button type="submit" className="btn btn--md btn--primary" disabled={submitting}>
                  Vote
                </button>
              </form>
            )}
          />
        </div>
      </div>
    </div>
  );
});
