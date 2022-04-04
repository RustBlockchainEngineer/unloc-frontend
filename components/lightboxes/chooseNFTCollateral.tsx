import React from 'react'

export interface INFTCollateral {
  NFTId: string
  NFTCollection: string
  NFTImage: string
}

interface IProps {
  NFT: INFTCollateral[]
}

const chooseNFTCollateral: React.FC<IProps> = ({ NFT }) => {
  return (
    <div>
      <div className='NFT-lb-header'>
        <h1>Choose a NFT for collateral</h1>
        SORT BY INPUT
      </div>
      <div className='NFT-lb-collateral-list'>{Object.values(NFT).map((item) => {})}</div>
    </div>
  )
}
