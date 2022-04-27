import React, { useState, useEffect } from 'react'

interface CustomSelectProps {
  classNames?: string
  options: string[]
  defaultOption?: string
  selectedOption: string
  setSelectedOption: (option: string) => void
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ classNames, options, defaultOption, selectedOption, setSelectedOption}: CustomSelectProps) => {
  const [hidden, setHidden] = useState(true)

  const handleHideOptions = (e: MouseEvent) => {
    const element = e.target as HTMLElement

    if (element.offsetParent && element.offsetParent.classList.contains('custom-select')) {
      return
    }
  
    setHidden(true)
  }

  const handleVisibilityForOptions = () => {
    setHidden(!hidden)
  }

  const handleSelectOption = (option: string) => {
    setSelectedOption(option)
    handleVisibilityForOptions()
  }

  useEffect(() => {
    window.addEventListener('click', handleHideOptions)

    return () => {
      window.removeEventListener('click', handleHideOptions)
    }
  })

  return <div className={`custom-select ${classNames}`}>
    <div className='custom-select__selected' onClick={() => handleVisibilityForOptions()}>
      { selectedOption || defaultOption }
      <i className='icon icon--sm icon--rnd--triangle--down'></i>
    </div>
    <ul className={`custom-select__options ${hidden ? 'hidden' : ''}`}>
      { options.map(option => <li key={option} className={option === selectedOption ? 'selected' : ''} onClick={() => handleSelectOption(option)}>{ option }</li>) }
    </ul>
  </div>
}
