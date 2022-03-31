import React from 'react'
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export const UserToolbox = () => {
  return (
    <div className='user-toolbox'>
      <h2>User Toolbox</h2>
      <WalletMultiButton />
      <WalletDisconnectButton />
    </div>
  )
}
