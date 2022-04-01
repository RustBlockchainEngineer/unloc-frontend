import { observer } from 'mobx-react-lite'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { LayoutTop } from '../../components/layout/layoutTop'
import Header from '../../components/singleOffer/Header/Header'
import Offer from '../../components/singleOffer/Offer/Offer'
import { StoreDataAdapter } from '../../components/storeDataAdapter'

type Props = {}

const MyOffers: NextPage = observer(({}) => {
  const router = useRouter()
  console.log(router.query.id)
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
