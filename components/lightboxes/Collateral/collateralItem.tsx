import React from "react";
import { NFTMetadata } from "@integration/nftLoan";

interface IProps {
  data: NFTMetadata;
  onClick: (data: NFTMetadata) => void;
  choosen: boolean;
}

export const CollateralItem: React.FC<IProps> = ({ data, onClick, choosen }) => {
  return (
    <div
      onClick={() => onClick(data)}
      className={`collateral-list-item ${choosen ? "active" : ""}`}>
      <img src={data.arweaveMetadata.image} className="collateral-image" />
      <div className="collateral-list-item-info">
        <h2>{data.arweaveMetadata.name}</h2>
        <div className="list-collection-name">
          <p>Collection</p>
          <p>
            {data.arweaveMetadata.collection === undefined ||
            data.arweaveMetadata.collection === null
              ? data.arweaveMetadata.name.slice(0, data.arweaveMetadata.name.lastIndexOf("#"))
              : typeof data.arweaveMetadata.collection === "string"
              ? data.arweaveMetadata.collection
              : data.arweaveMetadata.collection.name}
          </p>
        </div>
      </div>
    </div>
  );
};