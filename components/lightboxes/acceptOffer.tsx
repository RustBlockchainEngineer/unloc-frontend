import { useContext } from "react";
import { observer } from "mobx-react";
import Image from "next/image";
import { toast } from "react-toastify";

import { StoreContext } from "@pages/_app";

export const AcceptOffer = observer(() => {
  const store = useContext(StoreContext);
  const { acceptOfferData } = store.Lightbox;
  const { nftData } = store.SingleOffer;
  const { amount, duration, APR, totalRepay, currency, offerPublicKey } = acceptOfferData;

  const handleAcceptOffer = async (offerPublicKey: string): Promise<void> => {
    try {
      store.Lightbox.setContent("processing");
      store.Lightbox.setCanClose(false);
      store.Lightbox.setVisible(true);
      await store.Offers.handleAcceptOffer(offerPublicKey);
      toast.success(`Loan Accepted`, {
        autoClose: 3000,
        position: "top-center",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (e: any) {
      console.log(e);

      if (e.message === "User rejected the request.") {
        toast.error(`Transaction rejected`, {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(`Something went wrong`, {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } finally {
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(false);
    }
  };

  return (
    <div className="accept-offer">
      <h2>Lend Tokens</h2>
      <div className="collection">
        <div className="nft-image-circled">
          <Image alt="NFT Image" src={nftData.image} width={46} height={46} />
        </div>
        <p className="nft-name">{nftData.name}</p>
      </div>
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
      <button
        className="btn btn--md btn--primary"
        onClick={() => handleAcceptOffer(offerPublicKey)}>
        Confirm
      </button>
    </div>
  );
});
