import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { usePopperTooltip } from 'react-popper-tooltip'
import { StoreContext } from '@pages/_app'
import { ShowOnHover } from '@components/layout/showOnHover'
import { ClipboardButton } from '@components/layout/clipboardButton'
import { SolscanExplorerIcon } from '@components/layout/solscanExplorerIcon'
import ConnectWallet from '@components/connectWallet/ConnectWallet'
import { compressAddress } from '@utils/stringUtils/compressAdress'

export const MyOffersTop: React.FC = observer(() => {
  const store = useContext(StoreContext)
  const { wallet, walletKey, connected } = store.Wallet as any

  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip()

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
            <h2>
              <ShowOnHover label={`${compressAddress(4, walletKey.toBase58())}`}>
                <ClipboardButton data={walletKey.toBase58()} />
                <SolscanExplorerIcon type={'account'} address={walletKey.toBase58()} />
              </ShowOnHover>
            </h2>
          </>
        ) : (
          ''
        )}
      </div>
      <div className='my-offers-top__toolbox'>
        <button
          ref={setTriggerRef}
          className='btn btn--md btn--primary'
          onClick={() => {
            store.Lightbox.setContent('collateral')
            store.Lightbox.setVisible(true)
          }}
        >
          Deposit NFT
        </button>
        {visible && (
          <div ref={setTooltipRef} {...getTooltipProps({ className: 'tooltip-container' })}>
            Create a new Collateral from a NFT
          </div>
        )}
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
    <div className='connect-wallet-modal-root'>
      <ConnectWallet />
    </div>
  )
})
