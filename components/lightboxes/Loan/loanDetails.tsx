import { memo, useContext } from "react";
import { StoreContext } from "@pages/_app";
import Image from "next/image";

interface LoanDetails {
  isDetails: boolean;
}

export const LoanDetails = memo(({ isDetails }: LoanDetails) => {
  const store = useContext(StoreContext);
  const {
    sanitized: { image },
  } = store.MyOffers;

  return (
    <div className={`details-box ${isDetails ? "opened" : ""}`}>
      <div className="attributes">
        <p>Attributes</p>
        <div className="attributes-wrap">
          <div className="attribute">
            <span className="name">Background</span>
            <span>Lorem</span>
          </div>
          <div className="attribute">
            <span className="name">Type</span>
            <span>Lorem</span>
          </div>
          <div className="attribute">
            <span className="name">Hair</span>
            <span>Lorem</span>
          </div>
          <div className="attribute">
            <span className="name">Head</span>
            <span>Lorem Ipsum</span>
          </div>
          <div className="attribute">
            <span className="name">Lorem</span>
            <span>Lorem ipsum dolor sit amet</span>
          </div>
        </div>
      </div>
      <div className="details">
        <p>Details</p>
        <div className="details-wrap">
          <div className="info">
            <span className="label">Collateral ID</span>
            <span>4aFj...aS4i</span>
          </div>
          <div className="info">
            <span className="label">Mint address</span>
            <span>6EZA...ASoR</span>
          </div>
          <div className="info">
            <span className="label">Collection</span>
            <span>Kamil</span>
          </div>
          <div className="info">
            <span className="label">Artist royalities</span>
            <span>7.2%</span>
          </div>
        </div>
      </div>
      <Image src={image} width={336} height={336} />
    </div>
  );
});
