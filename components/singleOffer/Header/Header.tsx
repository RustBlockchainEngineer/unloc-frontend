import React from 'react'
import Image from 'next/image'

type IProps = {
  collectionName: string
  nftName: string
  nftImage: string
  nftAddress: string
  website: string
}

const Header: React.FC<IProps> = ({ collectionName, nftName, nftImage, nftAddress, website }) => {
  return (
    <div className='container'>
      <div className='nft-info'>
        {nftImage ? <Image alt='NFT Image' src={nftImage} width={96} height={96} className='nft-image' /> : <></>}
        <div className='nft-info-name'>
          <p>{collectionName}</p>
          <h1>{nftName}</h1>
        </div>
      </div>
      <div className='nft-info-metadata'>
        <p>
          Address <span>{nftAddress}</span>
        </p>
        <p>
          Website <span>{website}</span>
        </p>
      </div>
    </div>
  )
}

export default Header
