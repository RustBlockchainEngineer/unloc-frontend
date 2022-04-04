import { observer } from 'mobx-react-lite'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import React, { useContext, useEffect, useState } from 'react'
import { LayoutTop } from '../../components/layout/layoutTop'
import Header from '../../components/singleOffer/Header/Header'
import Offer from '../../components/singleOffer/Offer/Offer'
import { StoreDataAdapter } from '../../components/storeDataAdapter'
import { getQueryParamAsString } from '../../utils/getQueryParamsAsString'
import { compressAddress } from '../../utils/stringUtils/compressAdress'
import { StoreContext } from '../_app'
import { BlobLoader } from '../../components/layout/blobLoader'
import Footer from '../../components/layout/footer'

interface IOffer {
  amount: string
  apr: number
  currency: string
  duration: number
  id: string
  offerMint: string
  publicKey: PublicKey
  status: number
  totalRepay?: any
}

const SingleNftPage: NextPage = observer(({}) => {
  const router = useRouter()
  const store = useContext(StoreContext)

  const [loaded, setLoaded] = useState(false)
  const [message, setMessage] = useState<string>('')
  const { connected, wallet } = store.Wallet
  const { nftData, loansData } = store.SingleOffer

  const handleData = async () => {
    try {
      if (connected && wallet && router.query.id) {
        await store.SingleOffer.fetchNft(getQueryParamAsString(router.query.id))
        await store.SingleOffer.fetchSubOffers(getQueryParamAsString(router.query.id))
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  useEffect(() => {
    handleData()
  }, [router.query.id, connected, wallet])

  useEffect(() => {
    router.events.on('routeChangeStart', () => {
      store.SingleOffer.setNftData({
        collection: '',
        mint: '',
        image: '',
        name: '',
        external_url: ''
      })
      store.SingleOffer.setLoansData([])
    })
  }, [router.events, store.SingleOffer])

  return (
    <StoreDataAdapter>
      <div className='page my-offers'>
        <LayoutTop />
        {nftData ? (
          <Header
            collectionName={nftData.collection}
            nftAddress={nftData.mint}
            nftImage={nftData.image}
            nftName={nftData.name}
            website={nftData.external_url}
          />
        ) : (
          <></>
        )}
        {loansData && loansData.length ? (
          <div className='offer-grid'>
            {loansData.map((offer: IOffer) => {
              if (offer.status === 0 || offer.status === 6) {
                return (
                  <Offer
                    key={offer.id}
                    offerID={compressAddress(4, offer.id)}
                    status={offer.status.toString()}
                    amount={offer.amount}
                    token='USDC'
                    duration={offer.duration.toString()}
                    // durationRemaning='20' // TODO: include date of offer creation in Program data
                    APR={offer.apr}
                    totalRepay={offer.totalRepay}
                    btnMessage={'Lend Money'}
                  />
                )
              } else {
                return <></>
              }
            })}
          </div>
        ) : (
          <div className='offer-grid-empty'>
            <BlobLoader />
          </div>
        )}
        <Footer />
      </div>
      <div className='home-bg-bottom' />
    </StoreDataAdapter>
  )
})

export default SingleNftPage
