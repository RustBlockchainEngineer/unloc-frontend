import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { observer } from "mobx-react-lite";
import Image from "next/image";

import { useOffChainMetadata } from "@hooks/useOffChainMetadata";

interface IAcceptHeader {
  nftData: Metadata;
}

export const AcceptHeader = observer(({ nftData }: IAcceptHeader) => {
  const { json, isLoading } = useOffChainMetadata(nftData.data.uri);

  return (
    <div className="collection">
      {isLoading && <div>Loading</div>}
      {json && (
        <div className="nft-image-circled">
          <Image alt="NFT Image" src={json.image} width={46} height={46} />
        </div>
      )}
      <p className="nft-name">{nftData.data.name}</p>
    </div>
  );
});
