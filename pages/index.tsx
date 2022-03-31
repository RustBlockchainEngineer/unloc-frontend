import { useContext, useEffect, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { observer } from 'mobx-react'

import { StoreContext } from './_app'
import { localesHome } from '../constants/locales'
import { StoreDataAdapter } from '../components/storeDataAdapter'
import { LayoutTop } from '../components/layout/layoutTop'
import { OffersTop } from '../components/offersPage/offersTop'

const Home: NextPage = observer(() => {
  const store = useContext(StoreContext)
  const { wallet, connected } = store.Wallet

  const [loading, setLoading] = useState(true)

  const handleOffers = async () => {
    try {
      if (connected && wallet) {
        setLoading(true)
        await store.Offers.fetchOffers()
        // await store.Offers.fetchCollectionForNfts()
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

  useEffect(() => {
    console.log('offers: ', store.Offers.offers, store.Offers.offers.length)
  }, [store.Offers.offers])

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
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
            electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of
            Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
            Aldus PageMaker including versions of Lorem Ipsum.
          </p>
        </main>
        <div className='home-bg-bottom' />
      </div>
    </StoreDataAdapter>
  )
})

export default Home
