import React from 'react'
import { NFTMetadata } from '../../../../integration/nftLoan'

interface IProps {
  data: NFTMetadata
  onClick: (data: NFTMetadata) => void
  choosen: boolean
}

const LightboxItem: React.FC<IProps> = ({ data, onClick, choosen }) => {
  return (
    <div onClick={() => onClick(data)} className={`collateral-list-item ${choosen ? 'active' : ''}`}>
      <img src={data.arweaveMetadata.image} className='collateral-image' />
      <div className='collateral-list-item-info'>
        <h2>{data.arweaveMetadata.name}</h2>
        <div className='list-collection-name'>
          <p>Collection</p>
          <p>{data.arweaveMetadata.collection}</p>
        </div>
      </div>
    </div>
  )
}

export default LightboxItem
