import type { NextPage } from 'next'

import { StoreDataAdapter } from '../../components/storeDataAdapter'
import { LayoutTop } from '../../components/layout/layoutTop'

const MyOffers: NextPage = () => {
  return (
    <StoreDataAdapter>
      <div className='my-offers'>
        <LayoutTop />
        <h2>My Offers Page</h2>
      </div>
    </StoreDataAdapter>
  )
}

export default MyOffers
