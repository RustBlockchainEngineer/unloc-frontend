import { memo, useContext, useEffect, useMemo, useState } from "react";

import { StoreContext } from "@pages/_app";
import Image from "next/image";
import { compressAddress } from "@utils/stringUtils/compressAdress";
// import { IArweaveMetadata } from "../../../@types/nfts/nft";
import { NFTMetadata } from "@integration/nftLoan";

interface LoanDetails {
  isDetails: boolean;
}

export const LoanDetails = memo(({ isDetails }: LoanDetails) => {
  const store = useContext(StoreContext);
  const {
    sanitized: { image, name, collateralId, nftMint },
    nftData,
  } = store.MyOffers;

  const [nftArweaveMetadata, setNftArweaveMetadata] = useState<NFTMetadata | undefined>();

  useEffect(() => {
    console.log(nftData);
    const arweaveMetadata = nftData.find((item) => item.mint === nftMint);
    setNftArweaveMetadata(arweaveMetadata);
  }, []);

  const attributes = useMemo(() => {
    return nftArweaveMetadata?.arweaveMetadata.attributes?.map((item) => {
      return (
        <div className="attribute" key={item.trait_type}>
          <span className="name">{item.trait_type}</span>
          <span>{item.value}</span>
        </div>
      );
    });
  }, [nftArweaveMetadata]);

  return (
    <div className={`details-box ${isDetails ? "opened" : ""}`}>
      <div className="attributes">
        <p>Attributes</p>
        <div className="attributes-wrap">{attributes}</div>
      </div>
      <div className="details">
        <p>Details</p>
        <div className="details-wrap">
          <div className="info">
            <span className="label">Collateral ID</span>
            <span>{compressAddress(4, collateralId)}</span>
          </div>
          <div className="info">
            <span className="label">Mint address</span>
            <span>{compressAddress(4, nftMint)}</span>
          </div>
          <div className="info">
            <span className="label">Collection</span>
            <span>{name}</span>
          </div>
          <div className="info">
            <span className="label">Artist royalties</span>
            <span>{nftArweaveMetadata?.onChainMetadata.data.sellerFeeBasisPoints}%</span>
          </div>
        </div>
      </div>
      <Image src={image} width={336} height={336} />
    </div>
  );
});
