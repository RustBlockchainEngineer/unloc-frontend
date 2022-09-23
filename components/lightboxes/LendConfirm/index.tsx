import { useContext } from "react";

import { observer } from "mobx-react-lite";

import { StoreContext } from "@pages/_app";
import { errorCase, successCase } from "@utils/toast-error-handler";
import { LendConfirmHeader } from "./LendConfirmHeader";
import { acceptOffer } from "@utils/spl/unlocLoan";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useSendTransaction } from "@hooks/useSendTransaction";

export const LendConfirmation = observer(() => {
  const store = useContext(StoreContext);
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();
  const { lendConfirmationData } = store.Lightbox;
  const { nftData } = store.SingleOffer;
  const { amount, duration, APR, totalRepay, currency, offerPublicKey } = lendConfirmationData;

  const handleAcceptOffer = async (offerPublicKey: string) => {
    try {
      if (!wallet) throw Error("Connect your wallet");

      store.Lightbox.setContent("circleProcessing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);

      const tx = await acceptOffer(connection, wallet, new PublicKey(offerPublicKey));
      await sendAndConfirm(tx);
      successCase("Loan Accepted");
    } catch (e: any) {
      errorCase(e);
    } finally {
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(false);
    }
  };

  return (
    <div className="lend-confirmation">
      <h2>Lend Funds</h2>
      {nftData && <LendConfirmHeader nftData={nftData} />}
      <div className="offer-data">
        <div className="offer-data-top">Loan terms:</div>
        <div className="offer-data-liner">
          <div className="title">Amount</div>
          <div className="data">
            {amount} {currency}
          </div>
        </div>
        <div className="offer-data-liner">
          <div className="title">APR</div>
          <div className="data">{APR}</div>
        </div>
        <div className="offer-data-liner">
          <div className="title">Duration</div>
          <div className="data">{duration}</div>
        </div>
        <div className="offer-data-liner">
          <div className="title">Total Repay Amount</div>
          <div className="data">
            {totalRepay} {currency}
          </div>
        </div>
      </div>
      <button
        className="btn btn--md btn--primary"
        onClick={() => handleAcceptOffer(offerPublicKey)}>
        Confirm
      </button>
    </div>
  );
});
