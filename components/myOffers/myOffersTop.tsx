import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import ChooseNFTCollateral from '../lightboxes/chooseCollateral/chooseNFTCollateral'

export const MyOffersTop: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const { showLightboxCollateral } = store.Lightbox
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
        <button className='btn btn--md btn--primary' onClick={() => store.Lightbox.setShowLightboxCollateral(true)}>
          Deposit NFT
        </button>
        {wallet && wallet.adapter ? (
          <button className='btn btn--md btn--bordered' onClick={() => handleWalletDisconnect()}>
            Disconnect
          </button>
        ) : (
          ''
        )}
      </div>
      <div className='lightbox-collateral' style={{ display: `${showLightboxCollateral ? 'flex' : 'none'}` }}>
        <ChooseNFTCollateral />
      </div>
    </div>
  ) : (
    <div>Please connect your wallet first</div>
  )
})
