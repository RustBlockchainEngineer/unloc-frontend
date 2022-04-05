import React, { createContext, useEffect, useState, useContext } from 'react'
import type { NextPage } from 'next'
import { observer } from 'mobx-react'
import { PublicKey } from '@solana/web3.js'

import { StoreContext } from '../_app'
import { StoreDataAdapter } from '../../components/storeDataAdapter'
import { LayoutTop } from '../../components/layout/layoutTop'
import Footer from '../../components/layout/footer'
import { MyOffersTop } from '../../components/myOffers/myOffersTop'

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
        <MyOffersTop />
      </div>
      <div className='home-bg-bottom' />
      <Footer />
    </StoreDataAdapter>
  )
})

export default MyOffers
