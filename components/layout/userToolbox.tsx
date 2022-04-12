import React, { useContext } from 'react'
import { usePopperTooltip } from 'react-popper-tooltip'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'

export const UserToolbox = observer(() => {
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip()

  const store = useContext(StoreContext)
  const { theme } = store.Interface

  const handleThemeSet = () => {
    store.Interface.setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className='user-toolbox'>
      <WalletMultiButton />
      <button
        ref={setTriggerRef}
        className={`theme-switcher theme-switcher--${store.Interface.theme}`}
        onClick={() => handleThemeSet()}
      />
      {visible && (
        <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          Switch Theme
        </div>
      )}
    </div>
  )
})
