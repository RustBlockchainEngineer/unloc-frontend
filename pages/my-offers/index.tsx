import React, { useEffect, useContext, useState } from 'react'
import type { NextPage } from 'next'
import { observer } from 'mobx-react'
import { PublicKey } from '@solana/web3.js'
import { StoreContext } from '@pages/_app'
import { StoreDataAdapter } from '@components/storeDataAdapter'
import { LayoutTop } from '@components/layout/layoutTop'
import { LayoutTopMobile } from '@components/layout/layoutTopMobile'
import Footer from '@components/layout/footer'
import { MyOffersTop } from '@components/myOffers/myOffersTop'
import { MyOffersNftList } from '@components/myOffers/myOffersNftList'
import { MyLendingList } from '@components/myOffers/myLendingList'

const MyOffers: NextPage = observer(() => {
  const [tabVisible, setTabVisible] = useState('offers')

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
        <div className='container-tabbed'>
          <div className='container-tabbed-tabs'>
            <button
              className={`btn btn--md btn--bordered ${tabVisible === 'offers' ? 'active' : ''}`}
              onClick={() => setTabVisible('offers')}
            >
              Offers
            </button>
            <button
              className={`btn btn--md btn--bordered ${tabVisible === 'loans' ? 'active' : ''}`}
              onClick={() => setTabVisible('loans')}
            >
              Loans Given
            </button>
          </div>
          <div className='container-tabbed-content'>
            {connected && tabVisible === 'loans' ? <MyLendingList /> : ''}
            {connected && tabVisible === 'offers' ? <MyOffersNftList /> : ''}
          </div>
        </div>
      </div>
      <div className='home-bg-bottom' />

      <Footer />
      <LayoutTopMobile />
    </StoreDataAdapter>
  )
})

export default MyOffers
