import { observer } from 'mobx-react-lite'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'
import { LayoutTop } from '../../components/layout/layoutTop'
import Header from '../../components/singleOffer/Header/Header'
import Offer from '../../components/singleOffer/Offer/Offer'
import { StoreDataAdapter } from '../../components/storeDataAdapter'
import { getQueryParamAsString } from '../../utils/getQueryParamsAsString'
import { StoreContext } from '../_app'

type Props = {}

const MyOffers: NextPage = observer(({}) => {
  const router = useRouter()
  const store = useContext(StoreContext)

  const { connected, wallet } = store.Wallet
  const { nftData, loansData } = store.SingleOffer
  console.log(loansData)
  const [loaded, setLoaded] = useState(false)

  const handleData = async () => {
    try {
      setLoaded(false)
      if (connected && wallet && router.query.id) {
        // await store.SingleOffer.fetchNft(getQueryParamAsString(router.query.id))
        setLoaded(true)
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
  return (
    <StoreDataAdapter>
      {/* {console.log(data)} */}
      <div className='page my-offers'>
        <LayoutTop />
        <Header
          collectionName='test'
          nftAddress='4G7tnw4nFy1zK8KW77HJyDn4tTU4vFcwQJF3FF9ek5Rj'
          nftImage='test'
          nftName='test'
          website='unloc.xyz'
        />
        <div className='offer-grid'>
          <Offer
            offerID='1234-1234-1234-1234'
            status='Active'
            amount='10000'
            token='USDC'
            duration='90'
            durationRemaning='20'
            APR='20'
            totalReapy='10293'
          />
        </div>
      </div>
      <div className='home-bg-bottom' />
    </StoreDataAdapter>
  )
})

export default MyOffers
