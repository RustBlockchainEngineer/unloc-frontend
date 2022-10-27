import { useState, useEffect, useRef, useMemo, SyntheticEvent, useCallback } from "react";

interface CustomMultiSelectProps {
  classNames?: string;
  options: Array<{ label: string; value: string }>;
  title: string;
  disabled?: boolean;
  values?: string[];
  clearFilters?: () => void;
  onCheck: (option: string) => void;
}

export const CustomMultiSelect = ({
  disabled,
  title,
  options,
  values,
  onCheck,
}: CustomMultiSelectProps): JSX.Element => {
  const [hidden, setHidden] = useState(true);
  const [collectionsList, updateCollectionsList] =
    useState<Array<{ label: string; value: string }>>();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateCollectionsList(options);
  }, [options]);

  const toggleOptions = (): void => {
    !disabled && setHidden(!hidden);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent): void => {
      const target = event.target;
      if (target instanceof Element && !container.current?.contains(target)) setHidden(true);
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const searchFilterHandler = useCallback(
    (event: SyntheticEvent<HTMLInputElement, Event>): void => {
      const searchString = event.currentTarget.value;
      const result = options.filter((el) =>
        el.value.toUpperCase().includes(searchString.toUpperCase()),
      );
      updateCollectionsList(searchString.length ? result : options);
    },
    [collectionsList],
  );

  return (
    <div className="custom-multi-select-container" ref={container}>
      <div className={`custom-multi-select ${disabled ? "disabled" : ""}`} onClick={toggleOptions}>
        <div className="custom-multi-select__title">
          <span>{title}</span>
          <i className="icon icon--sm icon--filter--down" />
        </div>
      </div>
      <div className={`custom-multi-select__options ${hidden ? "hidden" : ""}`}>
        <div className="custom-multi-select__input">
          <input type="text" placeholder="Search for collection" onChange={searchFilterHandler} />
        </div>
        {collectionsList != null && (
          <CollectionList
            options={collectionsList}
            values={values}
            disabled={disabled}
            onCheck={onCheck}
            setHidden={setHidden}
          />
        )}
      </div>
    </div>
  );
};

type ICollection = Pick<CustomMultiSelectProps, "options" | "values" | "disabled" | "onCheck">;

interface ICollectionList extends ICollection {
  setHidden: (state: boolean) => any;
}

export const CollectionList = ({
  options,
  values,
  disabled,
  onCheck,
}: ICollectionList): JSX.Element => {
  const handleCheckedItem = (itemValue: string): boolean => {
    if (values != null) return values.includes(itemValue);

    return false;
  };

  const handleCheckOption = (e: SyntheticEvent, option: string): void => {
    e.stopPropagation();
    !disabled && onCheck(option);
  };

  const MemoizedList = (): JSX.Element =>
    useMemo(() => {
      return (
        <ul>
          {options.map((option) => (
            <li key={option.value}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name={option.value}
                  defaultChecked={handleCheckedItem(option.value)}
                  onClick={(e) => handleCheckOption(e, option.value)}
                />
                <span className="checkbox-custom rectangular"></span>
                <span className="checkbox-title">{option.label}</span>
              </label>
            </li>
          ))}
        </ul>
      );
    }, [options]);

  return <MemoizedList />;
};
