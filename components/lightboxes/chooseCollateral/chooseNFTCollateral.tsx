import { PublicKey } from '@solana/web3.js'
import LightboxItem from './lightboxItem/lightboxItem'
import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { NFTMetadata } from '../../../integration/nftLoan'
import { StoreContext } from '../../../pages/_app'

export interface INFTCollateral {
  NFTAddress: string
  NFTCollection: string
  NFTId: string
  NFTImage: string
}

const createOffer = (mint: string) => {
  console.log(mint)
}

const ChooseNFTCollateral: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const myOffers = store.MyOffers
  const { wallet, connection } = store.Wallet

  const [itemMint, setItemMint] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [sortOption, setSortOption] = useState<string>('')
  const [data, setData] = useState<NFTMetadata[]>()

  useEffect(() => {
    if (data) {
      if (sortOption === '') {
        return
      }
      setData(data.sort())
    }
  }, [sortOption])

  useEffect(() => {
    if (wallet && connection) {
      myOffers
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      await myOffers.getNFTsData()
    }

    fetchData()
      .then((res) => setData(myOffers.nftData))
      .catch((err) => console.log(err))
  }, [])

  const chooseNFT = (data: NFTMetadata) => {
    setItemMint(data.mint)
    setAddress(data.mint.toString())
  }

  const sortNFT = (option: string) => {
    setSortOption(option)
  }
  return (
    <div className='collateral-lightbox'>
      <div className='NFT-lb-header'>
        <h1>Choose a NFT for collateral</h1>
        <select onSelect={() => {}}>
          <option value='name'></option>
        </select>
      </div>
      <div className='NFT-lb-collateral-list'>
        {data?.map((item: NFTMetadata) => {
          console.log(item)
          return <LightboxItem data={item} onClick={chooseNFT} choosen={address === ''} />
        })}
      </div>
      <button onClick={() => createOffer(itemMint)} className='lb-collateral-button'>
        Use as Collateral
      </button>
    </div>
  )
})

export default ChooseNFTCollateral
