import React, { useEffect, useContext } from 'react'
import type { NextPage } from 'next'
import { observer } from 'mobx-react'
import { PublicKey } from '@solana/web3.js'
import { StoreContext } from '@pages/_app'
import { StoreDataAdapter } from '@components/storeDataAdapter'
import { LayoutTop } from '@components/layout/layoutTop'
import Footer from '@components/layout/footer'
import { MyOffersTop } from '@components/myOffers/myOffersTop'
import { MyOffersNftList } from '@components/myOffers/myOffersNftList'

const MyOffers: NextPage = observer(() => {
  const store = useContext(StoreContext)
  const { connected, walletKey } = store.Wallet

  const refreshSubOffers = async (wallet: { adapter: { publicKey: PublicKey } }) => {
    try {
      if (wallet && walletKey) {
        await store.MyOffers.getOffersByWallet(walletKey)
        await store.MyOffers.getNFTsData()
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

  return (
    <StoreDataAdapter>
      <div className='page my-offers'>
        <LayoutTop />
        <MyOffersTop />
        {connected ? <MyOffersNftList /> : ''}
      </div>
      <div className='home-bg-bottom' />

      <Footer />
    </StoreDataAdapter>
  )
})

export default MyOffers
