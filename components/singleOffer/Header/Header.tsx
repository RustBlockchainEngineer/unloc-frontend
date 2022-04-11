import React from 'react'
import Image from 'next/image'

import { ShowOnHover } from '../../layout/showOnHover'
import { ClipboardButton } from '../../layout/clipboardButton'
import { SolscanExplorerIcon } from '../../layout/solscanExplorerIcon'

type IProps = {
  collectionName: string
  nftName: string
  nftImage: string
  nftAddress: string
  website: string
}

export const Header: React.FC<IProps> = ({ collectionName, nftName, nftImage, nftAddress, website }) => {
  return (
    <div className='container'>
      <div className='nft-info'>
        {nftImage ? (
          <div className='nft-image'>
            <Image alt='NFT Image' src={nftImage} width={96} height={96} />
          </div>
        ) : (
          <></>
        )}
        <div className='nft-info-name'>
          <p>{collectionName}</p>
          <h1>{nftName}</h1>
        </div>
      </div>
      <div className='nft-info-metadata'>
        {nftAddress ? (
          <div className='metadata-line'>
            <label>Address</label>
            <ShowOnHover label={`#${nftAddress}`}>
              <ClipboardButton data={nftAddress} />
              <SolscanExplorerIcon type={'token'} address={nftAddress} />
            </ShowOnHover>
          </div>
        ) : (
          <></>
        )}
        {website ? (
          <div className='metadata-line'>
            <label>Website</label>
            <span>{website}</span>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
