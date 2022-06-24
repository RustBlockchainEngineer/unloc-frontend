import { useContext } from "react";

import { observer } from "mobx-react";

import { StoreContext } from "@pages/_app";
import { errorCase, successCase } from "@methods/toast-error-handler";
import { SliderAdapter } from "./Loan/sliderAdapter";
import { Form, Field } from "react-final-form";

export const Vote = observer(() => {
  const store = useContext(StoreContext);
  // const { setVote } = store.Lightbox;
  // const { amount, duration, APR, totalRepay, currency, offerPublicKey } = acceptOfferData;

  const nextVoteValues = { SMB: 20, DAA: 20, DeGods: 20, DT: 15, SolGods: 25 };

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

  return (
    <div className="vote-lightbox">
      <h2>Vote for collection</h2>
      <div className="vote-lightbox__form">
        <Form
          className="create-offer-container"
          onSubmit={handleVote}
          render={({ handleSubmit, submitting, values }) => (
            <form onSubmit={handleSubmit}>
              {Object.keys(nextVoteValues).map(function (key) {
                return (
                  <div className="input-row">
                    <div className="input-row__title">{key}</div>
                    <Field<number>
                      name={key}
                      min={0}
                      max={100}
                      step={1}
                      component={SliderAdapter}
                      initialValue={nextVoteValues[key]}
                    />
                    <div className="input-row__value">{nextVoteValues[key]}</div>
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
  );
});
