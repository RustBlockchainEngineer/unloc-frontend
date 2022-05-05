import {ReactNode, ReactElement, useState, useCallback, useEffect} from "react";

import {
  validateFilterInput,
  validateFilterInputMin,
  validateFilterInputMax
} from '../../methods/validators/filterValidator'
import {InputNumberArrows} from './inputNumberArrows'

interface FilterOffersInterface {
  title: string
  titleComponent?: ReactElement<any, any>
  customComponent?: ReactNode,
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

  const [min, setMin] = useState(valuesRange?.min);
  const [max, setMax] = useState(valuesRange?.max);

  useEffect(() => {
    setMin(valuesRange?.min);
    setMax(valuesRange?.max);
  }, [valuesRange]);

  const context = this;

  function debounce(func: (val: number) => void, timeout = 400) {
    let timer: NodeJS.Timeout;
    return (...args: [number]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(context, args)
      }, timeout);
    };
  }

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
    setMin(inputValue);
    if (inputValue && actionValidatorMin && validateFilterInputMin(inputValue, actionValidatorMin) && actionMin) {
      min && debounceMin(min);
    } else if (actionValidatorMin && actionMax) {
      debounceMax(actionValidatorMin)
    }
  }

  const handleActionMax = (inputValue: number) => {
    setMax(inputValue);
    if (inputValue && actionValidatorMax && validateFilterInputMax(inputValue, actionValidatorMax) && actionMax) {
      max && debounceMax(max);
    } else if (actionValidatorMax && actionMax) {
      debounceMax(actionValidatorMax)
    }
  }

  const debounceMin = useCallback(debounce((val) => actionMin && actionMin(val)), [valuesRange]);
  const debounceMax = useCallback(debounce((val) => actionMax && actionMax(val)), [valuesRange]);

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
              value={min}
              onChange={(e) => handleActionMin(Number(e.target.value))}
            />
            <InputNumberArrows value={min ? min : valuesRange.min} onChange={() => handleActionMin}/>
          </div>
          <div className='filter-line'>
            <span>Max: </span>
            <input
              className='max'
              type='number'
              value={max}
              onChange={(e) => handleActionMax(Number(e.target.value))}
            />
            <InputNumberArrows value={max ? max : valuesRange.max} onChange={() => handleActionMax}/>
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
