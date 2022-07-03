import { useContext, useMemo, useState } from "react";

import { observer } from "mobx-react";

import { StoreContext } from "@pages/_app";
import { errorCase, successCase } from "@methods/toast-error-handler";
import { SliderAdapter } from "./Loan/sliderAdapter";
import { Form, Field } from "react-final-form";
import { Decorator, getIn } from "final-form";
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

  const balancer = useMemo(
    () =>
      createDecorator({
        field: Object.keys(nextVoteValues),
        updates: (changedVal, changedName, allValues) => {
          console.log(changedVal, changedName, allValues);
          if (allValues) {
            const restVal = (100 - changedVal) / (Object.keys(allValues).length - 1);
            Object.keys(allValues).map(function (key) {
              if (key !== changedName) {
                console.log(key, changedName);
                allValues[key] = restVal;
              }
            });

            if (Object.values(allValues).reduce((a, b) => a + b, 0) == 100) {
              setNextVoteValues(allValues);
              return allValues;
            }
          }

          return {};
        },
      }) as Decorator<object, object>,
    [],
  );

  return (
    <div className="vote-lightbox">
      <h2>Vote for collection</h2>
      <div className="vote-lightbox__form">
        <div className="vote-lightbox__form">
          <Form
            className="create-offer-container"
            onSubmit={handleVote}
            decorators={[balancer]}
            initialValues={initialValues}
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
                        step={1}
                        component={SliderAdapter}
                      />
                      <div className="input-row__value">{nextVoteValues[key] + "%"}</div>

                      {/* <div className="input-row__value">
                        <Field<number>
                          component="input"
                          name={key}
                          type="number"
                          className="input-row__value--input"
                        />
                      </div> */}
                    </div>
                  );
                })}
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
