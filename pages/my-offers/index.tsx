import React, { useEffect, useContext, useState } from 'react'
import type { NextPage } from 'next'
import { observer } from 'mobx-react'
import { PublicKey } from '@solana/web3.js'
import { StoreContext } from '@pages/_app'
import { StoreDataAdapter } from '@components/storeDataAdapter'
import { LayoutTop } from '@components/layout/layoutTop'
import { LayoutTopMobile } from '@components/layout/layoutTopMobile'
import { MyOffersTop } from '@components/myOffers/myOffersTop'
import { MyOffersNftList } from '@components/myOffers/myOffersNftList'

const MyOffers: NextPage = observer(() => {
  const [activeVisible, setActiveVisible] = useState(true)
  const [depositedVisible, setDepositedVisible] = useState(true)

  const store = useContext(StoreContext)
  const { connected, walletKey } = store.Wallet
  const { activeHideable, depositedHideable } = store.MyOffers

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

  const handleActiveVisibility = () => {
    if (!activeHideable) return

    setActiveVisible(!activeVisible)
  }

  const handleDepositedVisibility = () => {
    if (!depositedHideable) return

    setDepositedVisible(!depositedVisible)
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
            <h1 onClick={handleActiveVisibility}>
              Active Offers
              {activeHideable && <i className={`icon icon--sm icon--filter--${activeVisible ? 'striped' : 'down'}`} />}
            </h1>
            <MyOffersNftList type='active' listVisible={activeVisible} />
          </div>
          <div className='active-offers--scrolldown'>
            <h1 onClick={handleDepositedVisibility}>
              My Vault
              {depositedHideable && <i className={`icon icon--sm icon--filter--${depositedVisible ? 'striped' : 'down'}`} />}
            </h1>
            <MyOffersNftList type='deposited' listVisible={depositedVisible} />
          </div>
        </div>
          : ''}
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  )
})

export default MyOffers
