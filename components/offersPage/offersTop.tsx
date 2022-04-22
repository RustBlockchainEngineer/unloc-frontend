import React, { useContext, useState } from 'react'
import { observer } from 'mobx-react'
import { StoreContext } from '@pages/_app'
import { Filter } from '@components/filters/filter'
import { CurrencyChanger } from '@components/layout/currencyChanger'

export const OffersTop = observer(() => {
  const store = useContext(StoreContext)
  const [currency, setCurrency] = useState(true)
  const {
    filterCollection,
    filterCollectionSelected,
    filterAprMin,
    filterAprMax,
    filterAmountMin,
    filterAmountMax,
    filterDurationMin,
    filterDurationMax,
    viewType,
    filtersVisible
  } = store.Offers

  return (
    <>
      <div className='layout-line'>
        <div className='offers-filters-wrapper'>
          <div className={`offers-filters ${filtersVisible ? 'active' : ''}`}>
            <Filter
              title='COLLECTIONS'
              type='multi'
              items={filterCollection}
              action={store.Offers.setFilterCollection}
              values={filterCollectionSelected}
            />
            <Filter
              title='LOAN AMOUNT'
              titleComponent={<CurrencyChanger state={currency} onClick={setCurrency} />}
              type='minmax'
              valuesRange={{ min: filterAmountMin, max: filterAmountMax }}
              actionMin={store.Offers.setFilterAmountMin}
              actionMax={store.Offers.setFilterAmountMax}
              actionValidatorMin={store.Offers.filterAmountValidatorMin}
              actionValidatorMax={store.Offers.filterAmountValidatorMax}
            />
            <Filter
              title='APR'
              type='minmax'
              valuesRange={{ min: filterAprMin, max: filterAprMax }}
              actionMin={store.Offers.setFilterAprMin}
              actionMax={store.Offers.setFilterAprMax}
              actionValidatorMin={store.Offers.filterAprValidatorMin}
              actionValidatorMax={store.Offers.filterAprValidatorMax}
            />
            <Filter
              title='DURATION (DAYS)'
              type='minmax'
              valuesRange={{ min: filterDurationMin, max: filterDurationMax }}
              actionMin={store.Offers.setFilterDurationMin}
              actionMax={store.Offers.setFilterDurationMax}
              actionValidatorMin={store.Offers.filterDurationValidatorMin}
              actionValidatorMax={store.Offers.filterDurationValidatorMax}
            />
          </div>
          <button
            className={`btn--filters btn btn--md btn--secondary ${filtersVisible ? 'active' : ''}`}
            onClick={() => {
              store.Offers.setFiltersVisible(!filtersVisible)
            }}
          >
            <i className='icon icon--vs filter--icon'></i>
            <span>FILTERS</span>
            <i className={`icon icon--vs filter--icon icon--filter${filtersVisible ? '--down' : '--striped'}`}></i>
          </button>
        </div>
        <div className='offers-top'>
          <h1>Offers</h1>

          <div className='offers-view'>
            <button
              className={`btn btn--md btn--grid btn--bordered ${viewType === 'grid' ? 'active' : ''}`}
              onClick={() => store.Offers.setViewType('grid')}
            >
              <i className='icon icon--sm icon--grid--dark' />
              <span>Grid</span>
            </button>
            <button
              className={`btn btn--md btn--table btn--bordered ${viewType === 'table' ? 'active' : ''}`}
              onClick={() => store.Offers.setViewType('table')}
            >
              <i className='icon icon--sm icon--table--dark' />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
})
