import React, { useState, useEffect, useRef } from 'react'

interface CustomMultiSelectProps {
  classNames?: string
  options: { label: string; value: string }[]
  title: string
  disabled?: boolean
  values?: string[]
  onCheck: (option: string) => void
  onReset?: () => void
}

export const CustomMultiSelect = ({
  disabled,
  classNames,
  title,
  options,
  values,
  onCheck,
  onReset
}: CustomMultiSelectProps) => {
  const [hidden, setHidden] = useState(true)
  const container = useRef<HTMLDivElement>(null)

  const handleCheckedItem = (itemValue: string): boolean => {
    if (values) {
      return values.includes(itemValue)
    }
    return false
  }

  const toggleOptions = () => {
    !disabled && setHidden(!hidden)
  }

  const handleCheckOption = (option: string) => {
    !disabled && onCheck(option)
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof Element && !container.current?.contains(target)) {
        setHidden(true)
      }
    }

    document.addEventListener('click', handleOutsideClick)

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  return (
    <div ref={container} className={`custom-multi-select ${classNames} ${disabled ? 'disabled' : ''}`}>
      <div className='custom-multi-select__title' onClick={toggleOptions}>
        <span>{title}</span>
        <i className='icon icon--sm icon--filter--down'></i>
      </div>
      <div className={`custom-multi-select__options ${hidden ? 'hidden' : ''}`}>
        {/* <div className={`custom-multi-select__reset`}>
          <button className='btn btn--md btn--bordered'>Reset</button>
        </div> */}
        <ul>
          {options.map((option) => (
            <li key={option.value}>
              <label className='checkbox-label'>
                <input
                  type='checkbox'
                  name={option.value}
                  defaultChecked={handleCheckedItem(option.value)}
                  onClick={() => handleCheckOption(option.value)}
                />
                <span className='checkbox-custom rectangular'></span>
                <span className='checkbox-title'>{option.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
