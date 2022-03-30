import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useWallet } from '@solana/wallet-adapter-react'

import { StoreContext } from '../pages/_app'
import { initLoanProgram } from '../integration/nftLoan'

type Props = {
  children?: React.ReactNode
}

export const StoreDataAdapter: React.FC<Props> = observer(({ children }: Props) => {
  const { wallet, connected } = useWallet()
  const store = useContext(StoreContext)

  useEffect(() => {
    if (connected && wallet) {
      initLoanProgram(wallet)
      store.Wallet.setConnected(connected)
      store.Wallet.setWallet(wallet)
    }
  }, [wallet, connected, store.Wallet])

  return <>{children}</>
})
