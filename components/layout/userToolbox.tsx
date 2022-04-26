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
        <div className='theme-switcher--header'>
          <i className='icon icon--sm icon--theme--sun' />
          <i className='icon icon--sm icon--theme--moon' />
        </div>
        <SwitchButton state={store.Interface.theme == 'light'} classNames={'theme-switcher--switch'} onClick={handleThemeSet} />
      </div>




      {/* {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          Switch Theme
        </div>
      )} */}
    </div>
  )
})
