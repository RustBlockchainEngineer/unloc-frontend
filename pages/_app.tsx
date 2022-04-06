import { FC, useMemo, createContext, useEffect } from 'react'
import type { AppProps } from 'next/app'

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

import { config } from '../constants/config'
import { rootStore } from '../stores/Root.store'
import { Lightbox } from '../components/lightboxes/lightbox'
import { CreateCollateral } from '../components/lightboxes/chooseCollateral/createCollateral'
import { CreateLoan } from '../components/lightboxes/createLoan/createLoan'
import '../styles/main.scss'

export const StoreContext = createContext(rootStore)

const Unloc: FC<AppProps> = ({ Component, pageProps }) => {
  const network = config.devnet ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet
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

  useEffect(() => {
    document.documentElement.className = ''
    document.documentElement.classList.add(`theme-dark`)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={rootStore.Wallet.handleWalletError}>
        <WalletModalProvider>
          <StoreContext.Provider value={rootStore}>
            <Component {...pageProps} />
            {rootStore.Lightbox.visible ? (
              <Lightbox>
                <>
                  {rootStore.Lightbox.content === 'collateral' ? <CreateCollateral /> : <></>}
                  {rootStore.Lightbox.content === 'loanCreate' ? <CreateLoan mode='new' /> : <></>}
                  {rootStore.Lightbox.content === 'loanUpdate' ? <CreateLoan mode='update' /> : <></>}
                </>
              </Lightbox>
            ) : (
              <></>
            )}
          </StoreContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default Unloc
