import { useContext, useMemo } from "react";

import { observer } from "mobx-react-lite";
import Image from "next/image";

import { BlobLoader } from "@components/layout/blobLoader";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { StoreContext } from "@pages/_app";
import { compressAddress } from "@utils/stringUtils/compressAdress";

interface ILoanDetails {
  isDetails: boolean;
}

export const LoanDetails = observer(({ isDetails }: ILoanDetails) => {
  const store = useContext(StoreContext);
  const {
    sanitized: { collateralId, metadata },
  } = store.MyOffers;
  const { isLoading, json } = useOffChainMetadata(metadata.data.uri);

  const attributes = useMemo(() => {
    if (!isLoading) return null;

    return json.attributes?.map((item) => (
      <div className="attribute" key={item.trait_type}>
        <span className="name">{item.trait_type}</span>
        <span>{item.value}</span>
      </div>
    ));
  }, [json, isLoading]);

  const renderImage = useMemo(() => <Image src={json.image} width={336} height={336} />, [json]);

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
            <span>{compressAddress(4, metadata.mint)}</span>
          </div>
          <div className="info">
            <span className="label">Collection</span>
            <span>{metadata.data.name}</span>
          </div>
          <div className="info">
            <span className="label">Artist royalties</span>
            <span>{metadata.data.sellerFeeBasisPoints * 0.01}%</span>
          </div>
        </div>
      </div>
      {isLoading ? <BlobLoader /> : renderImage}
    </div>
  );
});
