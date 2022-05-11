import React from "react";
import Image from "next/image";
import { ShowOnHover } from "@components/layout/showOnHover";
import { ClipboardButton } from "@components/layout/clipboardButton";
import { SolscanExplorerIcon } from "@components/layout/solscanExplorerIcon";

type IProps = {
  collectionName: string;
  nftName: string;
  nftImage: string;
  nftAddress: string;
  website: string;
  isYours?: boolean;
};

export const Header: React.FC<IProps> = ({
  collectionName,
  nftName,
  nftImage,
  nftAddress,
  website,
  isYours,
}) => {
  return (
    <div className="container">
      <div className="nft-info">
        {nftImage ? (
          <div className="nft-image">
            {isYours ? (
              <div className="owner-indicator">
                <i className="icon icon--owner" />
              </div>
            ) : (
              ""
            )}
            <Image alt="NFT Image" src={nftImage} width={96} height={96} />
          </div>
        ) : (
          <></>
        )}
        <div className="nft-info-name">
          <p>{collectionName}</p>
          <h1>{nftName}</h1>
        </div>
      </div>
      <div className="nft-info-metadata">
        <div className="nft-info-metadata__icons">
          <i className="icon icon--md icon--place" />
          <i className="icon icon--md icon--globe" />
        </div>
        <div>
          {nftAddress ? (
            <div className="metadata-line">
              <label>Address</label>
              <ShowOnHover label={`${nftAddress}`}>
                <ClipboardButton data={nftAddress} />
                <SolscanExplorerIcon type={"token"} address={nftAddress} />
              </ShowOnHover>
            </div>
          ) : (
            <></>
          )}
          {website ? (
            <div className="metadata-line">
              <label>Website</label>
              <span>{website}</span>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};
