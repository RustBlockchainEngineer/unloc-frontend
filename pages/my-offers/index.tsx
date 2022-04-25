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
  const [activeVisible, setActiveVisible] = useState(true)
  const [depositedVisible, setDepositedVisible] = useState(true)

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
        {connected ? <div>
          <div className='active-offers--scrolldown'>
            <h1 onClick={() => { setActiveVisible(!activeVisible) }}>
              Active Offers
              <i className={`icon icon--sm icon--filter--${activeVisible ? 'striped' : 'down'}`} />
            </h1>
            {activeVisible ? <MyOffersNftList type='active' /> : <></>}
          </div>
          <div className='active-offers--scrolldown'>
            <h1 onClick={() => { setDepositedVisible(!depositedVisible) }}>
              Deposited NFTs
              <i className={`icon icon--sm icon--filter--${depositedVisible ? 'striped' : 'down'}`} />
            </h1>
            {depositedVisible ? <MyOffersNftList type='deposited' /> : <></>}
          </div>
        </div>
          : ''}
      </div>
      <div className='home-bg-bottom' />

      <Footer />
      <LayoutTopMobile />
    </StoreDataAdapter>
  )
})

export default MyOffers
