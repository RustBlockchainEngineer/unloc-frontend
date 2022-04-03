import { useContext, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { observer } from 'mobx-react'

import { StoreContext } from './_app'
import { localesHome } from '../constants/locales'
import { StoreDataAdapter } from '../components/storeDataAdapter'
import { LayoutTop } from '../components/layout/layoutTop'
import { OffersTop } from '../components/offersPage/offersTop'
import { OffersGrid } from '../components/offersPage/offersGrid'
import { OffersTable } from '../components/offersPage/offersTable'

const Home: NextPage = observer(() => {
  const store = useContext(StoreContext)
  const { wallet, connected } = store.Wallet
  const { viewType } = store.Offers

  const [loading, setLoading] = useState(true)

  const handleOffers = async () => {
    try {
      if (connected && wallet) {
        setLoading(true)
        await store.Offers.getOffersForListings()
        setLoading(false)
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (wallet && connected) {
      handleOffers()
    }
  }, [wallet, connected])

  useEffect(() => {
    console.log('collections: ', store.Offers.nftCollections)
  }, [store.Offers.nftCollections])

  return (
    <StoreDataAdapter>
      <div className='page offers'>
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
          <LayoutTop />
          <OffersTop />
          {viewType === 'grid' ? <OffersGrid /> : <OffersTable />}
        </main>
        <div className='home-bg-bottom' />
      </div>
    </StoreDataAdapter>
  )
})

export default Home
