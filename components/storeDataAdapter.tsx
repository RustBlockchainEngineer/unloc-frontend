import { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { StoreContext } from '@pages/_app'
import { initLoanProgram } from '@integration/nftLoan'
import { PublicKey } from '@solana/web3.js'
import axios from 'axios'
import { toast } from 'react-toastify'

type Props = {
  children?: React.ReactNode
}

export const StoreDataAdapter: React.FC<Props> = observer(({ children }: Props) => {
  const { wallet, connected, disconnect, publicKey } = useWallet()
  const store = useContext(StoreContext)

  useEffect(() => {
    disconnect()
  }, [])

  useEffect(() => {
    const setWallet = async () => {
      if (connected && wallet && publicKey) {
        const response = await axios.post('/api/auth', { user: publicKey.toBase58() })

        if (!(response && response.data)) return

        const { isWhitelisted } = response.data

        if (!isWhitelisted) {
          toast.error('You are not whitelisted!', {
            autoClose: 3000,
            position: 'top-center',
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          })
          disconnect()
          return
        }

        initLoanProgram(wallet.adapter)
        store.GlobalState.fetchGlobalState()
        store.Wallet.setConnected(connected)
        store.Wallet.setWallet(wallet)
        store.Wallet.setHandleDisconnect(disconnect)
        store.Wallet.setWalletKey(publicKey as PublicKey)
      }
    }

    setWallet()
  }, [wallet, connected, store.Wallet])

  return <>{children}</>
})
