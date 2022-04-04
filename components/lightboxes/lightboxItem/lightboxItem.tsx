import React from 'react'
import { INFTCollateral } from '../chooseNFTCollateral'

interface IProps extends INFTCollateral {
  onClick: (data: INFTCollateral) => void
  choosen: boolean
}

const LightboxItem: React.FC<IProps> = ({ NFTAddress, NFTCollection, NFTId, NFTImage, onClick, choosen }) => {
  return (
    <div
      onClick={() => onClick({ NFTId, NFTCollection, NFTImage, NFTAddress })}
      className={`collateral-list-item ${choosen ? 'active' : ''}`}
    >
      <img src={NFTImage} className='collateral-image' />
      <div className='collateral-list-item-info'>
        <h2>{NFTId}</h2>
        <div className='list-collection-name'>
          <p>Collection</p>
          <p>{NFTCollection}</p>
        </div>
      </div>
    </div>
  )
}

export default LightboxItem
