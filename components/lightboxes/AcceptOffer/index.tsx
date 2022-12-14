import { useContext } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { observer } from "mobx-react-lite";

import { useSendTransaction } from "@hooks/useSendTransaction";
import { StoreContext } from "@pages/_app";
import { acceptLoanOffer } from "@utils/spl/unloc-loan";
import { errorCase, successCase } from "@utils/toast-error-handler";

import { AcceptHeader } from "./acceptHeader";

export const AcceptOffer = observer(() => {
  const store = useContext(StoreContext);
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();
  const { acceptOfferData } = store.Lightbox;
  const { nftData } = store.SingleOffer;
  const { amount, duration, APR, totalRepay, currency, offerPublicKey } = acceptOfferData;

  const handleAcceptOffer = async (offerPublicKey: string): Promise<void> => {
    try {
      if (wallet == null) throw Error("Connect your wallet");

      store.Lightbox.setContent("circleProcessing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);

      const tx = await acceptLoanOffer(connection, wallet, new PublicKey(offerPublicKey), []);
      await sendAndConfirm(tx!);
      successCase("Loan Accepted");
    } catch (error: any) {
      console.log({ error });
      errorCase(error);
    } finally {
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(false);
    }
  };

  return (
    <div className="accept-offer">
      <h2>Lend Tokens</h2>
      {nftData != null && <AcceptHeader nftData={nftData} />}
      <div className="collateral">
        <div className="nft-pill">
          <div className="data">
            <p>Amount</p>
            <span>
              {amount} {currency}
            </span>
          </div>
          <div className="data">
            <p>APR</p>
            <span>{APR} %</span>
          </div>
          <div className="data">
            <p>Duration</p>
            <span>{duration} days</span>
          </div>
          <div className="data">
            <p>Total Repay Amount</p>
            <span>
              {totalRepay} {currency}
            </span>
          </div>
        </div>
      </div>
      <div className="rewards">
        <span>Current Unloc rewards for this collection</span>
        <p>
          APR:
          <b>12.5%</b>
          <i className="icon icon--svs icon--unloc--light" />
        </p>
      </div>
      <button
        className="btn btn--md btn--primary"
        onClick={async () => await handleAcceptOffer(offerPublicKey)}>
        Confirm
      </button>
    </div>
  );
});
