import React, { useContext, useState } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { Filter } from '../filters/filter'

export const OffersTop = observer(() => {
  const store = useContext(StoreContext)
  const {
    filterCollection,
    filterCollectionSelected,
    filterAprMin,
    filterAprMax,
    filterAmountMin,
    filterAmountMax,
    filterDurationMin,
    filterDurationMax,
    viewType
  } = store.Offers

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
          <button
            className={`btn btn--md btn--bordered ${viewType === 'grid' ? 'active' : ''}`}
            onClick={() => store.Offers.setViewType('grid')}
          >
            <i className='icon icon--sm icon--grid--dark' />
            <span>Grid</span>
          </button>
          <button
            className={`btn btn--md btn--bordered ${viewType === 'table' ? 'active' : ''}`}
            onClick={() => store.Offers.setViewType('table')}
          >
            <i className='icon icon--sm icon--table--dark' />
            <span>Table</span>
          </button>
        </div>
      </div>
      <div className={`offers-filters ${filtersVisible ? 'active' : ''}`}>
        <Filter
          title='Collections'
          type='multi'
          items={filterCollection}
          action={store.Offers.setFilterCollection}
          values={filterCollectionSelected}
        />
        <Filter
          title='APR'
          type='minmax'
          valuesRange={{ min: filterAprMin, max: filterAprMax }}
          actionMin={store.Offers.setFilterAprMin}
          actionMax={store.Offers.setFilterAprMax}
        />
        <Filter
          title='Amount'
          type='minmax'
          valuesRange={{ min: filterAmountMin, max: filterAmountMax }}
          actionMin={store.Offers.setFilterAmountMin}
          actionMax={store.Offers.setFilterAmountMax}
        />
        <Filter
          title='Duration'
          type='minmax'
          valuesRange={{ min: filterDurationMin, max: filterDurationMax }}
          actionMin={store.Offers.setFilterDurationMin}
          actionMax={store.Offers.setFilterDurationMax}
        />
      </div>
    </div>
  )
})
