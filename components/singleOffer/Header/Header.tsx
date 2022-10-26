import { memo, useMemo } from "react";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import Image from "next/image";

import { ClipboardButton } from "@components/layout/clipboardButton";
import { ShowOnHover } from "@components/layout/showOnHover";
import { SolscanExplorerIcon } from "@components/layout/solscanExplorerIcon";
import { useCollectionName } from "@hooks/useCollectionName";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { compressAddress } from "@utils/stringUtils/compressAdress";

interface IProps {
  nftData: Metadata;
  isYours?: boolean;
}

export const Header = memo(({ nftData, isYours }: IProps) => {
  const mintAddress = useMemo(() => nftData.mint.toBase58(), [nftData]);
  const { json, isLoading } = useOffChainMetadata(nftData.data.uri);
  const { collection, isLoading: isLoadingCollection } = useCollectionName(mintAddress);

  return (
    <div className="container">
      <div className="nft-info">
        {!isLoading && (
          <div className="nft-image">
            {isYours && (
              <div className="owner-indicator">
                <i className="icon icon--owner" />
              </div>
            )}
            <Image alt="NFT Image" src={json.image} width={96} height={96} />
          </div>
        )}
        {!isLoadingCollection && !isLoading && (
          <div className="nft-info-name">
            <p>{collection}</p>
            <h1>{json.name}</h1>
          </div>
        )}
      </div>
      <div className="nft-info-metadata">
        <div className="nft-info-metadata__icons">
          <i className="icon icon--md icon--place" />
          <i className="icon icon--md icon--globe" />
        </div>
        <div>
          <div className="metadata-line">
            <label>Address</label>
            <ShowOnHover label={`${compressAddress(4, mintAddress)}`}>
              <ClipboardButton data={mintAddress} />
              <SolscanExplorerIcon type={"token"} address={mintAddress} />
            </ShowOnHover>
          </div>
          {!isLoading && (
            <div className="metadata-line">
              <label>Website</label>
              <span>{json.external_url}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
