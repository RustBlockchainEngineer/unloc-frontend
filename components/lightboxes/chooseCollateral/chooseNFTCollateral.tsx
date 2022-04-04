import { PublicKey } from '@solana/web3.js'
import LightboxItem from './lightboxItem/lightboxItem'
import React, { useContext, useState } from 'react'
import { observer } from 'mobx-react'
import { NFTMetadata } from '../../../integration/nftLoan'
import { StoreContext } from '../../../pages/_app'

export interface INFTCollateral {
  NFTId: string
  NFTCollection: string
  NFTImage: string
  NFTAddress: PublicKey
}

interface IProps {
  NFT: INFTCollateral[]
}

const createOffer = (data: INFTCollateral | undefined) => {
  console.log(data)
}

const ChooseNFTCollateral: React.FC<IProps> = observer(({ NFT }) => {
  const store = useContext(StoreContext)

  const [item, setItem] = useState<INFTCollateral>()
  const [address, setAddress] = useState<string>('')

  const chooseNFT = (data: INFTCollateral) => {
    setItem(data)
    setAddress(data.NFTAddress.toString())
  }
  return (
    <div className='collateral-lightbox'>
      <div className='NFT-lb-header'>
        <h1>Choose a NFT for collateral</h1>
        SORT BY INPUT
      </div>
      <div className='NFT-lb-collateral-list'>
        {Object.values(NFT).map((item) => {
          console.log(item)
          return (
            <LightboxItem
              NFTAddress={item.NFTAddress}
              NFTCollection={item.NFTCollection}
              NFTId={item.NFTId}
              NFTImage={item.NFTId}
              onClick={chooseNFT}
              choosen={address === ''}
            />
          )
        })}
      </div>
      <button onClick={() => createOffer(item)} className='lb-collateral-button'>
        Use as Collateral
      </button>
    </div>
  )
})

export default ChooseNFTCollateral
