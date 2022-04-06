import { PublicKey } from '@solana/web3.js'
import LightboxItem from './lightboxItem/lightboxItem'
import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { NFTMetadata, setOffer } from '../../../integration/nftLoan'
import { StoreContext } from '../../../pages/_app'
import { StoreDataAdapter } from '../../storeDataAdapter'

export interface INFTCollateral {
  NFTAddress: string
  NFTCollection: string
  NFTId: string
  NFTImage: string
}

const createOffer = (mint: string) => {
  setOffer(new PublicKey(mint))
}

const ChooseNFTCollateral: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const myOffers = store.MyOffers
  const { setShowLightboxCollateral } = store.Lightbox
  const { wallet, connection, walletKey } = store.Wallet

  const [itemMint, setItemMint] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [sortOption, setSortOption] = useState<string>('')
  const [data, setData] = useState<NFTMetadata[]>(myOffers.collaterables)
  useEffect(() => {
    if (data) {
      if (sortOption === '') {
        return
      }
      setData(
        data.sort((a, b) =>
          a.arweaveMetadata.name > b.arweaveMetadata.name ? 1 : b.arweaveMetadata.name > a.arweaveMetadata.name ? -1 : 0
        )
      )
    }
  }, [sortOption])

  useEffect(() => {
    if (wallet && walletKey) {
      const fetchData = async () => {
        await myOffers.getUserNFTs(walletKey)
        await myOffers.getNFTsData()
      }
      fetchData()
        .then(() => setData(myOffers.collaterables))
        .catch((err) => console.log(err))
    }
  }, [wallet, connection, walletKey])

  const chooseNFT = (mint: any) => {
    setItemMint(mint)
    setAddress(mint.toString())
  }

  const sortNFT = (option: string) => {
    setSortOption(option)
  }
  return (
    <StoreDataAdapter>
      <div className='collateral-lightbox'>
        <div className='NFT-lb-header'>
          <h1>Choose a NFT for collateral</h1>
          <select onChange={(e) => sortNFT(e.target.value)} className='sort-select'>
            <option value=''>Sort by</option>
            <option value='name'>Sort by name</option>
          </select>
        </div>
        <div className='NFT-lb-collateral-list'>
          {data?.map((item: NFTMetadata) => {
            return (
              <LightboxItem key={item.mint} data={item} onClick={() => chooseNFT(item.mint)} choosen={address === ''} />
            )
          })}
        </div>
        <button
          onClick={() => {
            createOffer(itemMint)
            // store.Lightbox.setShowLightboxCollateral(false)
          }}
          className='lb-collateral-button'
        >
          Use as Collateral
        </button>
      </div>
    </StoreDataAdapter>
  )
})

export default ChooseNFTCollateral
