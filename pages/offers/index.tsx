import type { NextPage } from 'next'
import { StoreDataAdapter } from '../../components/storeDataAdapter'
import { LayoutTop } from '../../components/layout/layoutTop'
import Header from '../../components/singleOffer/Header/Header'
import Offer from '../../components/singleOffer/Offer/Offer'
import { observer } from 'mobx-react'
import { getQueryParamAsString } from '../../utils/getQueryParamsAsString'
import { StoreContext } from '../_app'
import { useContext, useEffect, useState } from 'react'
import { getOfferList } from '../../integration/nftLoan'
import Footer from '../../components/layout/footer'

const MyOffers: NextPage = observer(() => {
  const store = useContext(StoreContext)
  const { connected, wallet } = store.Wallet
  const [loaded, setLoaded] = useState(false)
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
    </StoreDataAdapter>
  )
})

export default MyOffers
