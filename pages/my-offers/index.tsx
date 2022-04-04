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
            NFTAddress: new PublicKey('856jKmXupTBXeE3F7kvzk5UFe4oo5scjbAaKdoReeRdi')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('3CGPVTdBUDXvSuUK9SbBue374HiBs1smgqKSWoeUPjGU')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('D2ZmM1Nrr7C9Q3gjCZo8ctTWHFQFJDthvaBq9rSYoQ5j')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('7U4E7p7hxXUj1w8EmWJiBiNazQeBLKSEuHSH2dcnVxJs')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('2zb9BnADv1VVP9C7i3sQ7hU1iphFE1DcrP12b3iYLJWU')
          },
          {
            NFTId: '1',
            NFTCollection: 'collection 1',
            NFTImage: 'test',
            NFTAddress: new PublicKey('Gsh7wYapR9v1CdKUgd2HmvyUwY61QbgF9GVCm9JvPwR3')
          }
        ]}
      />
      <Footer />
    </StoreDataAdapter>
  )
})

export default MyOffers
