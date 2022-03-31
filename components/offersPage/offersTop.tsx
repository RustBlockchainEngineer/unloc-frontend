import React, { useContext, useState } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'

export const OffersTop = observer(() => {
  const store = useContext(StoreContext)

  const [filtersVisible, setFiltersVisible] = useState(true)

  return (
    <div className='layout-line'>
      <div className='offers-top'>
        <h1>Offers</h1>

        <button
          className='btn btn--secondary'
          onClick={() => {
            setFiltersVisible(!filtersVisible)
          }}
        >
          Filters
        </button>

        <div className='offers-view'>
          <button className='btn btn--bordered' onClick={() => store.Offers.setViewType('grid')}>
            <i className='icon icon--md icon--grid' />
            <span>Grid</span>
          </button>
          <button className='btn btn--bordered' onClick={() => store.Offers.setViewType('table')}>
            <i className='icon icon--md icon--table' />
            <span>Table</span>
          </button>
        </div>
      </div>
      <div className={`offers-filters ${filtersVisible ? 'active' : ''}`}>filters goes here</div>
    </div>
  )
})
