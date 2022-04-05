import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'

export const MyOffersTop: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const { wallet, walletKey, connected } = store.Wallet as any

  const handleWalletDisconnect = () => {
    if (wallet && wallet.adapter) {
      store.Wallet.handleDisconnect()
    }
  }

  return connected ? (
    <div className='my-offers-top'>
      <div className='my-offers-top__heading'>
        {walletKey ? (
          <>
            <span className='wallet-label'>Your wallet address:</span>
            <h2>{walletKey.toBase58()}</h2>
          </>
        ) : (
          ''
        )}
      </div>
      <div className='my-offers-top__toolbox'>
        <button className='btn btn--md btn--primary'>Deposit NFT</button>
        {wallet && wallet.adapter ? (
          <button className='btn btn--md btn--bordered' onClick={() => handleWalletDisconnect()}>
            Disconnect
          </button>
        ) : (
          ''
        )}
      </div>
    </div>
  ) : (
    <div>Please connect your wallet first</div>
  )
})
