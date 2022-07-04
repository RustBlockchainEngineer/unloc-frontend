import { useContext, useMemo, useState } from "react";

import { observer } from "mobx-react";

import { StoreContext } from "@pages/_app";
import { errorCase, successCase } from "@methods/toast-error-handler";
import { SliderAdapter } from "./Loan/sliderAdapter";
import { Form, Field } from "react-final-form";
import { createForm } from "final-form";
import createDecorator from "final-form-calculate";

export const Vote = observer(() => {
  const store = useContext(StoreContext);
  // const { setVote } = store.Lightbox;
  // const { amount, duration, APR, totalRepay, currency, offerPublicKey } = acceptOfferData;

  const initialValues = { SMB: 20, DAA: 20, DeGods: 20, DT: 15, SolGods: 25 };
  const [nextVoteValues, setNextVoteValues] = useState<any>(initialValues);

  const handleVote = async (): Promise<void> => {
    try {
      store.Lightbox.setContent("processing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);
      //await store.Offers.setVote(offerPublicKey);
      successCase("Loan Accepted");
    } catch (e: any) {
      errorCase(e);
    } finally {
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(false);
    }
  };

  const [memoForm, unsubscribe] = useMemo(() => {
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
        if (!form.getFieldState(name)?.active || !allValues || !prevValues) {
          return {};
        }

        // Omit the field that has been changed by the user
        // @ts-ignore
        const { [name]: ommited, ...rest } = allValues;

        // We need to get the number of fields that aren't 0.
        // The idea is that if a field is 0, we don't update it anymore.
        const updatedFields = Object.keys(rest).reduce(
          (acc, key) => (acc += rest[key] > 0 ? 1 : 0),
          0,
        );
        const delta = (value - prevValues[name]) / updatedFields;

        Object.keys(rest).forEach((key) => {
          if (rest[key] > 0) {
            rest[key] -= delta;
          } else {
            rest[key] = 0;
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
                        max={100}
                        // step={1}
                        component={SliderAdapter}
                      />
                      <div className="input-row__value">{values[key].toFixed(2) + "%"}</div>
                    </div>
                  );
                })}
                <div>
                  Total: {Object.keys(values).reduce((acc, key) => (acc += values[key]), 0)}
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
