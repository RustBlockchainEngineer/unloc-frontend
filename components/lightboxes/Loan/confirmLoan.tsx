import { memo, useCallback, useContext } from "react";

import Image from "next/image";
import { StoreContext } from "@pages/_app";
import { errorCase, successCase } from "@methods/toast-error-handler";

export const ConfirmLoan = memo(() => {
  const store = useContext(StoreContext);
  const { connected, wallet, walletKey } = store.Wallet;
  const {
    preparedOfferData: { amount, duration, currency, APR, repayValue },
    sanitized: { image, name },
  } = store.MyOffers;

  const confirm = useCallback(async (): Promise<void> => {
    if (connected && wallet && walletKey) {
      store.Lightbox.setContent("processing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);
      try {
        await store.MyOffers.handleCreateSubOffer(
          store.MyOffers.activeNftMint,
          Number(amount),
          Number(duration),
          Number(APR),
          currency,
        );
        successCase("Loan Offer Created");
      } catch (e: any) {
        errorCase(e);
      } finally {
        store.Lightbox.setVisible(false);
        store.Lightbox.setCanClose(true);
        await store.MyOffers.refetchStoreData();
      }
    }
  }, []);

  const edit = useCallback(async (): Promise<void> => {
    if (connected && wallet && walletKey) {
      try {
        store.Lightbox.setContent("loanCreate");
        store.Lightbox.setVisible(true);
      } catch (e: any) {
        errorCase(e);
      }
    }
  }, []);

  console.log(image);

  return (
    <div className="confirm-offer-container">
      <div className="header">
        <h1>Offer Review</h1>
      </div>
      <div className="collateral-info">
        <p>Your collateral:</p>
        <div className="collection">
          <Image src={image} width={38} height={38} />
          <p>{name}</p>
        </div>
      </div>
      <div className="terms-info">
        <p>Your terms:</p>
        <div>
          <span>Loan</span>
          <span>
            {amount} {currency}
          </span>
        </div>
        <div>
          <span>Duration</span>
          <span>
            {duration} {duration > 1 ? "Days" : "Day"}
          </span>
        </div>
        <div>
          <span>APR</span>
          <span>{APR} %</span>
        </div>
        <div>
          <span>Full repayment</span>
          <span>
            {repayValue} {currency}
          </span>
        </div>
      </div>
      <div className="actions">
        <button type="button" className="btn btn--md btn--bordered" onClick={edit}>
          Edit Offer
        </button>
        <button type="button" className="btn btn--md btn--primary" onClick={confirm}>
          Confirm
        </button>
      </div>
    </div>
  );
});
