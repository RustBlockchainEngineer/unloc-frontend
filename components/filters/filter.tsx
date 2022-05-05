import React from 'react'
import { validateFilterInput, validateFilterInputMin, validateFilterInputMax } from '../../methods/validators/filterValidator'
import { InputNumberArrows } from './inputNumberArrows'
interface FilterOffersInterface {
  title: string
  titleComponent?: React.ReactElement<any, any>
  customComponent?: React.ReactNode,
  type: 'single' | 'multi' | 'minmax' | 'custom'
  action?: (value: string) => void
  actionMin?: (value: number) => void
  actionMax?: (value: number) => void
  actionValidator?: number
  actionValidatorMin?: number
  actionValidatorMax?: number
  values?: string[]
  valuesRange?: { min: number; max: number }
  items?: { label: string; value: string }[]
}

export const Filter = ({
  title,
  titleComponent,
  customComponent,
  type,
  items,
  action,
  actionMin,
  actionMax,
  actionValidator,
  actionValidatorMin,
  actionValidatorMax,
  values,
  valuesRange
}: FilterOffersInterface) => {
  const handleCheckedItem = (itemValue: string): boolean => {
    if (values) {
      return values.includes(itemValue)
    }

    return false
  }

  const handleDevCollectionsLabels = (label: string) => {
    if (label === 'Dave test collection 2') {
      return 'Dev Only 1'
    } else if (label === 'Youtube') {
      return 'Dev Only 2'
    } else {
      return label
    }
  }

  const handleAction = (inputValue: string) => {
    if (inputValue && validateFilterInput(inputValue, '') && action) {
      action(inputValue)
    }
  }

  const handleActionMin = (inputValue: number) => {
    if (inputValue && actionValidatorMin && validateFilterInputMin(inputValue, actionValidatorMin) && actionMin) {
      actionMin(inputValue)
    } else if (actionValidatorMin && actionMax) {
      actionMax(actionValidatorMin)
    }
  }

  const handleActionMax = (inputValue: number) => {
    if (inputValue && actionValidatorMax && validateFilterInputMax(inputValue, actionValidatorMax) && actionMax) {
      actionMax(inputValue)
    } else if (actionValidatorMax && actionMax) {
      actionMax(actionValidatorMax)
    }
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
                onChange={() => handleAction(item.value)}
              />
              <span className='checkbox-custom rectangular'></span>
            </label>
            <div className='input-title'>{handleDevCollectionsLabels(item.label)}</div>
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
          <h5>{title}</h5>{titleComponent ? titleComponent : ''}
        </div>
        <div className='filter-minmax'>
          <div className='filter-line'>
            <span>Min: </span>
            <input
              className='min'
              type='number'
              value={valuesRange.min}
              onChange={(e) => handleActionMin(Number(e.target.value))}
            />
            <InputNumberArrows value={valuesRange.min} onChange={handleActionMin} />
          </div>
          <div className='filter-line'>
            <span>Max: </span>
            <input
              className='max'
              type='number'
              value={valuesRange.max}
              onChange={(e) => handleActionMax(Number(e.target.value))}
            />
            <InputNumberArrows value={valuesRange.max} onChange={handleActionMax} />
          </div>
        </div>
      </div>
    ) : (
      <></>
    )
  }

  const renderCustom = () => {
    return (
      <div className='filter-generic'>
        <div className='filter-generic__top'>
          <h5>{title}</h5>
          {titleComponent ? titleComponent : ''}
        </div>
        {customComponent}
      </div>
    )
  }

  const renderFilterByType = () => {
    if ((type === 'single' || type === 'multi') && items && Array.isArray(items)) {
      return renderList()
    } else if (type === 'minmax') {
      return renderMinMax()
    } else if (type === 'custom') {
      return renderCustom()
    }

    return <></>
  }

  return renderFilterByType()
}
