import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image'
import { observer } from 'mobx-react'
import { WalletDisconnectButton } from '@solana/wallet-adapter-react-ui'

import { StoreContext } from '../../pages/_app'

export const MyOffersTop: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const { wallet } = store.Wallet as any
  const [walletKey, setWalletKey] = useState('')
  const [walletName, setWalletName] = useState('')
  const [walletIcon, setWalletIcon] = useState('')

  const handleWalletDisconnect = () => {
    if (wallet && wallet.adapter) {
      wallet.adapter._wallet.disconnect()
    }
  }

  useEffect(() => {
    if (wallet && wallet.adapter) {
      console.log(wallet)
      setWalletKey(wallet.adapter._publicKey.toBase58())
      setWalletIcon(wallet.adapter.icon)
      setWalletName(wallet.adapter.name)
    }
  }, [wallet])

  return (
    <div className='my-offers-top'>
      <div className='my-offers-top__left'>
        {walletIcon ? (
          <div className='wallet-info'>
            <Image className='wallet-icon' src={walletIcon} alt='Wallet Icon' width='32px' height='32px' />
            <span>{walletName}</span>
          </div>
        ) : (
          ''
        )}
        <h2>{walletKey}</h2>
      </div>
      <div className='my-offers-top__right'>
        <button>Deposit NFT</button>
        {wallet && wallet.adapter ? <button onClick={() => handleWalletDisconnect()}>Disconnect</button> : ''}
      </div>
    </div>
  )
})
