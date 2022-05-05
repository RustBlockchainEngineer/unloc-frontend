import React, { useContext, useEffect, useState } from 'react'
import { usePopperTooltip } from 'react-popper-tooltip'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'
import { SwitchButton } from './switchButton'

export const UserToolbox = observer(() => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip()

  const store = useContext(StoreContext)
  const { theme } = store.Interface

  const handleThemeSet = () => {
    store.Interface.setTheme(theme === 'dark' ? 'light' : 'dark')
    localStorage.setItem('unloc-theme', theme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('unloc-theme')
    if (savedTheme && savedTheme.length && (savedTheme === 'dark' || savedTheme === 'light')) {
      store.Interface.setTheme(savedTheme)
    }
  })

  return (
    <div className='user-toolbox'>
      <WalletMultiButton />

      <div className='theme-switcher'>
        <SwitchButton state={store.Interface.theme == 'light'} classNames={'theme-switcher--switch'} onClick={handleThemeSet} />
      </div>
    </div>
  )
})
