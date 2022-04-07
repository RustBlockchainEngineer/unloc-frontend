import React, { useContext, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { observer } from 'mobx-react'

import { NFTMetadata, setOffer } from '../../../integration/nftLoan'
import { StoreContext } from '../../../pages/_app'
import { StoreDataAdapter } from '../../storeDataAdapter'
import { CollateralItem } from './collateralItem'

export interface INFTCollateral {
  NFTAddress: string
  NFTCollection: string
  NFTId: string
  NFTImage: string
}

export const CreateCollateral: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const myOffers = store.MyOffers
  const { wallet, connection, walletKey } = store.Wallet

  const [itemMint, setItemMint] = useState<string>('')
  const [sortOption, setSortOption] = useState<string>('')
  const [data, setData] = useState<NFTMetadata[]>(myOffers.collaterables)

  const chooseNFT = (mint: any) => {
    if (mint === itemMint) {
      setItemMint('')
    } else {
      setItemMint(mint)
    }
  }

  const sortNFT = (option: string) => {
    setSortOption(option)
  }

  const createOffer = (mint: string) => {
    setOffer(new PublicKey(mint))
  }

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

  return (
    <StoreDataAdapter>
      <div className='collateral-lightbox'>
        {data && data.length ? (
          <>
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
                  <CollateralItem
                    key={item.mint}
                    data={item}
                    onClick={() => chooseNFT(item.mint)}
                    choosen={item.mint === itemMint}
                  />
                )
              })}
            </div>
            <button
              onClick={() => {
                createOffer(itemMint)
                store.Lightbox.setVisible(false)
              }}
              className='lb-collateral-button'
            >
              Use as Collateral
            </button>
          </>
        ) : (
          <div className='collateral-empty'>
            <h2>No whitelisted NFTs in your wallet</h2>
          </div>
        )}
      </div>
    </StoreDataAdapter>
  )
})
