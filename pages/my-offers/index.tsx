import React, { createContext, useEffect, useState, useContext } from 'react'
import type { NextPage } from 'next'
import { observer } from 'mobx-react'
import { PublicKey } from '@solana/web3.js'

import { StoreContext } from '../_app'
import { StoreDataAdapter } from '../../components/storeDataAdapter'
import { LayoutTop } from '../../components/layout/layoutTop'
import Header from '../../components/singleOffer/Header/Header'
import Footer from '../../components/layout/footer'
import ChooseNFTCollateral from '../../components/lightboxes/chooseNFTCollateral'

const MyOffers: NextPage = observer(() => {
  const store = useContext(StoreContext)
  const { wallet, connected } = store.Wallet
  const { offers } = store.MyOffers

  const refreshSubOffers = async (wallet: { adapter: { publicKey: PublicKey } }) => {
    try {
      if (wallet && wallet.adapter.publicKey) {
        await store.MyOffers.getOffersByWallet(wallet.adapter.publicKey)
        await store.MyOffers.getSubOffersByOffers()
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  useEffect(() => {
    if (connected && store.Wallet.wallet) {
      refreshSubOffers(store.Wallet.wallet)
    }
  }, [connected, store.Wallet.wallet])

  useEffect(() => {
    if (offers && offers.length > 0) {
      // store.UserWallet.getSubOffersByOffers() // this might be totally not needed
      store.MyOffers.getNFTsData()
    }
  }, [offers, store.MyOffers, store.MyOffers.offers])

  return (
    <StoreDataAdapter>
      <div className='page my-offers'>
        <LayoutTop />
        <h2>My Offers Page</h2>
      </div>
      <div className='home-bg-bottom' />
      <ChooseNFTCollateral
        NFT={[
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('DSJdURFMnzPnDRmZA2LSUR15W4AooWb9RPqPoYJuWA4J')
          },
          {
            NFTId: '1',
            NFTCollection: 'colledasdasdasdasction 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('DSJdURFMnzPnDRmZA2LSUR15W4AooWb9RPqPoYJuWA4J')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('DSJdURFMnzPnDRmZA2LSUR15W4AooWb9RPqPoYJuWA4J')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('DSJdURFMnzPnDRmZA2LSUR15W4AooWb9RPqPoYJuWA4J')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('DSJdURFMnzPnDRmZA2LSUR15W4AooWb9RPqPoYJuWA4J')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('Gsh7wYapR9v1CdKUgd2HmvyUwY61QbgF9GVCm9JvPwR3')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('Gsh7wYapR9v1CdKUgd2HmvyUwY61QbgF9GVCm9JvPwR3')
          }
        ]}
        onSend={(data: any) => {
          console.log('send!')
        }}
      />
      <Footer />
    </StoreDataAdapter>
  )
})

export default MyOffers
