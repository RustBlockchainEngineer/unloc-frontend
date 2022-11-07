import { useCallback } from "react";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import Image from "next/image";

import { currencies, findTokenBySymbol } from "@constants/currency";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { useStore } from "@hooks/useStore";
import { uiAmountToAmount } from "@utils/spl/common";
import { createLoanSubOffer } from "@utils/spl/unloc-loan";
import { errorCase, successCase } from "@utils/toast-error-handler";

export const ConfirmLoan = observer(() => {
  const { Lightbox, MyOffers } = useStore();
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();
  const {
    preparedOfferData: { uiAmount, uiDuration, currency, APR, repayValue },
    sanitized: { metadata },
  } = MyOffers;
  const { isLoading, json } = useOffChainMetadata((metadata as Metadata).data.uri);

  const confirm = useCallback(async (): Promise<void> => {
    if (wallet != null) {
      Lightbox.setContent("circleProcessing");
      Lightbox.setCanClose(false);
      Lightbox.setVisible(true);

      try {
        const token = findTokenBySymbol(currency);
        const nftMint = new PublicKey(MyOffers.activeNftMint);
        const amount = uiAmountToAmount(uiAmount, token.decimals);
        const duration = dayjs.duration(uiDuration, "days").asSeconds();

        const tx = await createLoanSubOffer(
          connection,
          wallet,
          new BN(amount),
          new BN(duration),
          new BN(APR),
          nftMint,
          new PublicKey(currencies[currency].mint),
        );
        await sendAndConfirm(tx);
        successCase("Loan Offer Created");
      } catch (error: any) {
        console.log({ error });
        errorCase(error);
      } finally {
        Lightbox.setVisible(false);
        Lightbox.setCanClose(true);
        await MyOffers.refetchStoreData();
      }
    }
  }, []);

  const edit = useCallback(async (): Promise<void> => {
    if (wallet != null)
      try {
        Lightbox.setContent("loanCreate");
        Lightbox.setVisible(true);
      } catch (e: any) {
        errorCase(e);
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
            {uiAmount} {currency}
          </span>
        </div>
        <div>
          <span>Duration</span>
          <span>
            {uiDuration} {uiDuration > 1 ? "Days" : "Day"}
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
