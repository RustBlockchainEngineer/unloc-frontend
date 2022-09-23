import { useCallback, useContext } from "react";

import Image from "next/image";
import { StoreContext } from "@pages/_app";
import { errorCase, successCase } from "@utils/toast-error-handler";
import { observer } from "mobx-react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createSubOffer } from "@utils/spl/unloc-loan";
import { PublicKey } from "@solana/web3.js";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { useSendTransaction } from "@hooks/useSendTransaction";

export const ConfirmLoan = observer(() => {
  const store = useContext(StoreContext);
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();
  const {
    preparedOfferData: { amount, duration, currency, APR, repayValue },
    sanitized: { metadata },
  } = store.MyOffers;
  const { isLoading, json } = useOffChainMetadata(metadata.data.uri);

  const confirm = useCallback(async (): Promise<void> => {
    if (wallet) {
      store.Lightbox.setContent("circleProcessing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);

      try {
        const nftMint = new PublicKey(store.MyOffers.activeNftMint);
        const tx = await createSubOffer(
          connection,
          wallet,
          nftMint,
          currency,
          APR,
          duration,
          amount,
        );
        await sendAndConfirm(tx);
        successCase("Loan Offer Created");
      } catch (e: any) {
        console.log(e);
        errorCase(e);
      } finally {
        store.Lightbox.setVisible(false);
        store.Lightbox.setCanClose(true);
        await store.MyOffers.refetchStoreData();
      }
    }
  }, []);

  const edit = useCallback(async (): Promise<void> => {
    if (wallet) {
      try {
        store.Lightbox.setContent("loanCreate");
        store.Lightbox.setVisible(true);
      } catch (e: any) {
        errorCase(e);
      }
    }
  }, []);

  return (
    <div className="confirm-offer-container">
      <div className="header">
        <h1>Offer Review</h1>
      </div>
      <div className="collateral-info">
        <p>Your collateral:</p>
        {isLoading ? (
          <div>Loading</div>
        ) : (
          <div className="collection">
            {isLoading ? <div>Loading...</div> : <Image src={json.image} width={38} height={38} />}
            <p>{json.name}</p>
          </div>
        )}
      </div>
      <div className="terms-info row-division">
        <p className="row-division">Your terms:</p>
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
