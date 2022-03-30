import { FC, useMemo, createContext } from 'react'
import type { AppProps } from 'next/app'

// Wallet Integration
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import { rootStore } from '../stores/Root.store'
import '../styles/main.scss'

export const StoreContext = createContext(rootStore)

const Unloc: FC<AppProps> = ({ Component, pageProps }) => {
  const network = WalletAdapterNetwork.Devnet // base this on config
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network })
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <StoreContext.Provider value={rootStore}>
            <Component {...pageProps} />
          </StoreContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default Unloc
