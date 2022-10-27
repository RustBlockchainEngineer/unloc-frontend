import React, { useMemo, useState } from "react";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { SubOffer } from "@unloc-dev/unloc-loan-solita";
import BN from "bn.js";
import Image from "next/image";
import Link from "next/link";

import { currencyMints } from "@constants/currency";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { ILightboxOffer } from "@stores/Lightbox.store";

import { OffersGridItemHover } from "./offersGridItemHover";

interface OffersGridItemInterface {
  subOffer: PublicKey;
  offer: PublicKey;
  subOfferData: SubOffer;
  nftData: Metadata;
  handleConfirmOffer: (offer: ILightboxOffer) => void;
  totalRepay: any;
  amount: string;
  collection: string;
  isYours?: boolean;
}

export const OffersGridItem = ({
  subOffer,
  offer,
  subOfferData,
  nftData,
  handleConfirmOffer,
  totalRepay,
  amount,
  collection,
  isYours,
}: OffersGridItemInterface): JSX.Element => {
  const [hover, setHover] = useState<boolean>(false);
  const offerAddress = useMemo(() => offer.toBase58(), [offer]);
  const subOfferAddress = useMemo(() => subOffer.toBase58(), [subOffer]);
  const apr = useMemo(() => subOfferData.aprNumerator.toString(), []);
  const tokenName = useMemo(() => currencyMints[subOfferData.offerMint.toBase58()], [subOfferData]);
  const duration = useMemo(
    () => new BN(subOfferData.loanDuration).divn(3600 * 24).toString(),
    [subOfferData],
  );

  const { isLoading, json } = useOffChainMetadata(nftData.data.uri);

  if (isLoading) return <div>Loading</div>;

  return (
    <div
      className="offers-grid-item"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      {isYours && (
        <div className="owner-indicator">
          <i className="icon icon--owner" />
        </div>
      )}
      <OffersGridItemHover
        visible={hover}
        APR={apr}
        name={json.name}
        totalRepay={totalRepay}
        amount={amount}
        handleConfirmOffer={handleConfirmOffer}
        duration={duration}
        currency={tokenName}
        subOfferAddress={subOfferAddress}
        offer={offer}
        collection={collection}
        isYours={isYours}
      />
      <Link href={`/offers/${offerAddress}`}>
        <a>
          <div className="hover-data" style={{ visibility: `${hover ? "hidden" : "visible"}` }}>
            <div className="hover-data-item">
              <span className="label">APR</span>
              <span className="content">{apr} %</span>
            </div>
            <div className="hover-data-item">
              <span className="label">Amount</span>
              <span className="content">
                {amount} {tokenName}
              </span>
            </div>
            <div className="hover-data-item">
              <span className="label">Duration</span>
              <span className="content">{duration} Days</span>
            </div>
          </div>
          {json && <Image src={json.image} alt="NFT Picture" layout="fill" />}
        </a>
      </Link>
    </div>
  );
};
