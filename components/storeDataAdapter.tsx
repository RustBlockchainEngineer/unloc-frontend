import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useWallet } from '@solana/wallet-adapter-react'

import { StoreContext } from '../pages/_app'
import { initLoanProgram } from '../integration/nftLoan'
import { PublicKey } from '@solana/web3.js'

type Props = {
  children?: React.ReactNode
}

export const StoreDataAdapter: React.FC<Props> = observer(({ children }: Props) => {
  const { wallet, connected, disconnect, publicKey } = useWallet()
  const store = useContext(StoreContext)

  useEffect(() => {
    if (connected && wallet) {
      initLoanProgram(wallet.adapter)
      store.Wallet.setConnected(connected)
      store.Wallet.setWallet(wallet)
      store.Wallet.setHandleDisconnect(disconnect)
      store.Wallet.setWalletKey(publicKey as PublicKey)
    }
  }, [wallet, connected, store.Wallet])

  return <>{children}</>
})
