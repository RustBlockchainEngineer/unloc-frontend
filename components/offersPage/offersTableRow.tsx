import { useCallback, useContext, SyntheticEvent } from "react";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";

import { ILightboxOffer } from "@stores/Lightbox.store";
import { StoreContext } from "@pages/_app";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { calculateRepayValue } from "@utils/loansMath";

interface OffersTableItemInterface {
  subOfferKey: string;
  offerKey: string;
  nftData: Metadata;
  APR: string;
  amount: string;
  duration: string;
  currency: string;
  handleConfirmOffer: (offer: ILightboxOffer) => void;
  count?: number;
  isYours?: boolean;
  collection: string;
  totalRepay: string;
}

export const OffersTableRow = ({
  subOfferKey,
  offerKey,
  nftData,
  APR,
  handleConfirmOffer,
  amount,
  duration,
  currency,
  isYours,
  collection,
  totalRepay,
}: OffersTableItemInterface) => {
  const store = useContext(StoreContext);
  const { denominator } = store.GlobalState;
  const { connection } = useConnection();
  const { json, isLoading } = useOffChainMetadata(nftData.data.uri);

  const handlePrevent = useCallback(
    async (e: SyntheticEvent<HTMLButtonElement, Event>) => {
      if (!isYours) {
        e.stopPropagation();
        e.preventDefault();
        await store.SingleOffer.fetchOffer(connection, new PublicKey(offerKey));
        handleConfirmOffer({
          offerPublicKey: subOfferKey,
          amount,
          APR,
          duration,
          totalRepay,
          currency,
        });
      }
    },
    [subOfferKey, handleConfirmOffer],
  );

  return (
    <div className="offers-table-row" key={subOfferKey}>
      <Link href={`/offers/${offerKey}`}>
        <a>
          <div className="row-cell">
            {isYours ? (
              <div className="owner-indicator">
                <i className="icon icon--owner" />
              </div>
            ) : (
              ""
            )}
            {isLoading ? (
              <div>Loading</div>
            ) : (
              <Image src={json.image} alt="NFT Picture" width={36} height={36} />
            )}
            <span className="text-content">{nftData.data.name}</span>
          </div>
          <div className="row-cell">
            <button className={isYours ? "deactivated" : ""} onClick={handlePrevent}>
              {isYours ? "Can't lend" : `Lend ${currency}`}
            </button>
          </div>
          <div className="row-cell">
            <span className="text-content collection">{collection}</span>
          </div>
          <div className="row-cell">
            <span className="text-content">{amount}</span>
          </div>
          <div className="row-cell">
            <span className="text-content">
              <i className={`icon icon--sm icon--currency--${currency}`} />
            </span>
          </div>
          <div className="row-cell">
            <span className="text-content">{APR} %</span>
          </div>
          <div className="row-cell">
            <span className="text-content">{duration} Days</span>
          </div>
          <div className="row-cell">
            <span className="text-content">
              {calculateRepayValue(Number(amount), Number(APR), Number(duration), denominator)}
            </span>
          </div>
        </a>
      </Link>
    </div>
  );
};
