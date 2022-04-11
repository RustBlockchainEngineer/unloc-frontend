import React from 'react'

interface FilterOffersInterface {
  title: string
  type: 'single' | 'multi' | 'minmax'
  action?: (value: string) => void
  actionMin?: (value: number) => void
  actionMax?: (value: number) => void
  values?: string[]
  valuesRange?: { min: number; max: number }
  items?: { label: string; value: string }[]
}

export const Filter = ({
  title,
  type,
  items,
  action,
  actionMin,
  actionMax,
  values,
  valuesRange
}: FilterOffersInterface) => {
  const handleCheckedItem = (itemValue: string): boolean => {
    if (values) {
      return values.includes(itemValue)
    }

    return false
  }

  const renderList = () => {
    const data =
      items && items.length && action ? (
        items.map((item) => (
          <li key={`filter-item--${item.value}`}>
            <label className='checkbox-label'>
              <input
                type='checkbox'
                name={item.value}
                defaultChecked={handleCheckedItem(item.value)}
                onChange={() => action(item.value)}
              />
              <span className='checkbox-custom rectangular'></span>
            </label>
            <div className='input-title'>{item.label}</div>
          </li>
        ))
      ) : (
        <></>
      )

    return (
      <div className='filter-generic'>
        <div className='filter-generic__top'>
          <h5>{title}</h5>
        </div>
        <ul>{data}</ul>
      </div>
    )
  }

  const renderMinMax = () => {
    return valuesRange && actionMin && actionMax ? (
      <div className='filter-generic'>
        <div className='filter-generic__top'>
          <h5>{title}</h5>
        </div>
        <div className='filter-minmax'>
          <div className='filter-line'>
            <span>Min: </span>
            <input
              className='min'
              type='number'
              value={valuesRange.min}
              onChange={(e) => actionMin(Number(e.target.value))}
            />
          </div>
          <div className='filter-line'>
            <span>Max: </span>
            <input
              className='max'
              type='number'
              value={valuesRange.max}
              onChange={(e) => actionMax(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    ) : (
      <></>
    )
  }

  const renderFilterByType = () => {
    if ((type === 'single' || type === 'multi') && items && Array.isArray(items)) {
      return renderList()
    } else if (type === 'minmax') {
      return renderMinMax()
    }

    return <></>
  }

  return renderFilterByType()
}
