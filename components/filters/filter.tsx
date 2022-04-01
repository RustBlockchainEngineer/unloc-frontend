import React from 'react'

interface FilterOffersInterface {
  title: string
  type: 'single' | 'multi' | 'minmax'
  action?: (value: string[]) => void
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
          <li key={item.value} onClick={() => action([item.value])}>
            <input type='checkbox' defaultChecked={handleCheckedItem(item.value)} />
            <span>{item.label}</span>
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
          <input
            className='min'
            type='number'
            value={valuesRange.min}
            onChange={(e) => actionMin(Number(e.target.value))}
          />
          <input
            className='max'
            type='number'
            value={valuesRange.max}
            onChange={(e) => actionMax(Number(e.target.value))}
          />
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
