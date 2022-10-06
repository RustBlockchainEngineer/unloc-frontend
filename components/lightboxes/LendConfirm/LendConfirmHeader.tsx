import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { observer } from "mobx-react-lite";
import Image from "next/image";

import { useOffChainMetadata } from "@hooks/useOffChainMetadata";

export const LendConfirmHeader = observer(({ nftData }: { nftData: Metadata }) => {
  const { json, isLoading } = useOffChainMetadata(nftData.data.uri);

  return (
    <div className="collateral">
      <div className="label">Collateral:</div>
      {isLoading && <div>Loading</div>}
      {json && (
        <div className="nft-pill">
          <div className="nft-image-circled">
            <Image alt="NFT Image" src={json.image} width={38} height={38} />
          </div>
          <div className="nft-name">{json.name}</div>
        </div>
      )}
    </div>
  );
});
