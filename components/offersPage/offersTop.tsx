import React, { useContext, useState } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { FilterOffers } from '../filters/filterOffers'

export const OffersTop = observer(() => {
  const store = useContext(StoreContext)
  const { collectionFilters, collectionFilterSelected } = store.Offers

  const [filtersVisible, setFiltersVisible] = useState(true)

  return (
    <div className='layout-line'>
      <div className='offers-top'>
        <h1>Offers</h1>

        <button
          className={`btn--filters btn btn--md btn--secondary ${filtersVisible ? 'active' : ''}`}
          onClick={() => {
            setFiltersVisible(!filtersVisible)
          }}
        >
          Filters
        </button>

        <div className='offers-view'>
          <button className='btn btn--md btn--bordered' onClick={() => store.Offers.setViewType('grid')}>
            <i className='icon icon--sm icon--grid--dark' />
            <span>Grid</span>
          </button>
          <button className='btn btn--md btn--bordered' onClick={() => store.Offers.setViewType('table')}>
            <i className='icon icon--sm icon--table--dark' />
            <span>Table</span>
          </button>
        </div>
      </div>
      <div className={`offers-filters ${filtersVisible ? 'active' : ''}`}>
        <FilterOffers
          title='Collections'
          items={collectionFilters}
          action={store.Offers.setCollectionFilters}
          value={collectionFilterSelected}
        />
      </div>
    </div>
  )
})
