import { useState, useEffect, useRef, useMemo } from 'react'

interface CustomMultiSelectProps {
  classNames?: string
  options: { label: string; value: string }[]
  title: string
  disabled?: boolean
  values?: string[]
  clearFilters?: () => void
  onCheck: (option: string) => void
}

export const CustomMultiSelect = ({
  disabled,
  title,
  options,
  values,
  clearFilters,
  onCheck
}: CustomMultiSelectProps) => {
  const [hidden, setHidden] = useState(true)
  const container = useRef<HTMLDivElement>(null)

  const uncheckAll = () => {
    clearFilters && clearFilters();
  }

  const toggleOptions = () => {
    !disabled && setHidden(!hidden)
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
    <div ref={container} className={`custom-multi-select ${disabled ? 'disabled' : ''}`}>
      <div className='custom-multi-select__title' onClick={toggleOptions}>
        <span>{title}</span>
        <i className='icon icon--sm icon--filter--down'></i>
      </div>
      <div className={`custom-multi-select__options ${hidden ? 'hidden' : ''}`}>
        <div className={`custom-multi-select__reset`}>
          <button onClick={uncheckAll} className='btn btn--md btn--bordered'>Reset</button>
        </div>
        <CollectionList options={options}
          values={values}
          disabled={disabled}
          onCheck={onCheck}
          setHidden={setHidden}
        />
      </div>
    </div>
  )
}

type ICollection = Pick<CustomMultiSelectProps, "options" | "values" | "disabled" | "onCheck">;

interface CollectionList extends ICollection {
  setHidden: (state: boolean) => any;
}

export const CollectionList = ({options, values, disabled, onCheck, setHidden}: CollectionList) => {

  const handleCheckedItem = (itemValue: string): boolean => {
    if (values) {
      return values.includes(itemValue)
    }
    return false
  }

  const handleCheckOption = (option: string) => {
    !disabled && onCheck(option);
    !disabled && setHidden(false);
  }

  const MemoizedList = () => useMemo(() => {
    return (
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
      </ul>)
  }, [values]);

  return <MemoizedList/>;
}