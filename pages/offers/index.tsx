import type { NextPage } from 'next'
import { StoreDataAdapter } from '@components/storeDataAdapter'
import { LayoutTop } from '@components/layout/layoutTop'
import { LayoutTopMobile } from '@components/layout/layoutTopMobile'
import { Header } from '@components/singleOffer/Header/Header'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'
import { useContext, useState } from 'react'
import Footer from '@components/layout/footer'

const MyOffers: NextPage = observer(() => {
  return (
    <StoreDataAdapter>
      <div className='page my-offers'>
        <LayoutTop />
        <Header
          collectionName='test'
          nftAddress='4G7tnw4nFy1zK8KW77HJyDn4tTU4vFcwQJF3FF9ek5Rj'
          nftImage='test'
          nftName='test'
          website='unloc.xyz'
        />
      </div>
      <div className='home-bg-bottom' />
      <Footer />
      <LayoutTopMobile />
    </StoreDataAdapter>
  )
})

export default MyOffers
