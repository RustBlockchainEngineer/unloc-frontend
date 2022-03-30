import type { NextPage } from 'next'
import Head from 'next/head'
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { localesHome } from '../constants/locales'
import { StoreDataAdapter } from '../components/storeDataAdapter'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>{localesHome.pageTitle}</title>

        <meta name='description' content='UNLOC your NFTs full potential' />
        <meta property='og:title' content='UNLOC your NFTs full potential' />
        <meta property='og:url' content='https://unloc.xyz' />
        <meta property='og:image' content='https://unloc.xyz/icons/apple-touch-icon.pngg' />
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/icons/favicon-16x16.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/icons/favicon-32x32.png' />
        <link rel='manifest' href='/site.webmanifest' />

        <meta name='msapplication.TileColor' content='#e00a7f' />
        <meta name='theme-color' content='#e00a7f' />

        <meta name='robots' content='all' />
        <meta name='google' content='nositelinksearchbox' />
        <meta name='google' content='notranslate' key='notranslate' />

        <meta property='og:type' content='website' />
        <meta name='twitter:card' content='summary_large_image' />
      </Head>

      <main>
        <StoreDataAdapter>
          <WalletMultiButton />
          <WalletDisconnectButton />
        </StoreDataAdapter>
      </main>
    </div>
  )
}

export default Home
