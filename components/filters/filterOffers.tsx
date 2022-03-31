import React from 'react'

interface FilterOffersInterface {
  title: string
  items: { label: string; value: string }[]
  action: (value: string) => void
  value: string
}

export const FilterOffers = ({ title, items, action, value }: FilterOffersInterface) => {
  const renderItems = () => {
    return items.map((item) => (
      <li key={item.value} onClick={() => action(item.value)}>
        <input type='checkbox' checked={item.value === value} readOnly />
        {item.label}
      </li>
    ))
  }
  return (
    <div className='filter-offers'>
      <h4 className='filter-title'>{title}</h4>
      <ul>{renderItems()}</ul>
    </div>
  )
}
