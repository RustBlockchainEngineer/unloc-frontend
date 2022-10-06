import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";

interface IProps {
  metadata: Metadata;
  onClick: (data: Metadata) => void;
  chosen: boolean;
}

export const CollateralItem = ({ metadata, onClick, chosen }: IProps) => {
  const { json, isLoading } = useOffChainMetadata(metadata.data.uri);

  if (isLoading) return <div></div>;

  return (
    <div
      onClick={() => onClick(metadata)}
      className={`collateral-list-item ${chosen ? "active" : ""}`}>
      <img src={json.image} className="collateral-image" />
      <div className="collateral-list-item-info">
        <h2>{json.name}</h2>
        <div className="list-collection-name">
          <p>Collection</p>
          <p>
            {json.collection === undefined || json.collection === null
              ? json.name.slice(0, json.name.lastIndexOf("#"))
              : typeof json.collection === "string"
              ? json.collection
              : json.collection.name}
          </p>
        </div>
      </div>
    </div>
  );
};
