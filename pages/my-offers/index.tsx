import type { NextPage } from 'next'

import { StoreDataAdapter } from '../../components/storeDataAdapter'
import { LayoutTop } from '../../components/layout/layoutTop'

const MyOffers: NextPage = () => {
  return (
    <StoreDataAdapter>
      <div className='page my-offers'>
        <LayoutTop />
        <h2>My Offers Page</h2>
      </div>
      <div className='home-bg-bottom' />
    </StoreDataAdapter>
  )
}

export default MyOffers
