import React, { useContext } from 'react'
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'

export const UserToolbox = observer(() => {
  const store = useContext(StoreContext)
  const { theme } = store.Interface

  const handleThemeSet = () => {
    store.Interface.setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className='user-toolbox'>
      <h2>User Toolbox</h2>

      <button onClick={() => handleThemeSet()}>{store.Interface.theme}</button>
      <WalletMultiButton />
      <WalletDisconnectButton />
    </div>
  )
})
