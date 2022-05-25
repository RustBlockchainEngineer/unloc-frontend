import {
  ReactNode,
  useState,
  useCallback,
  ChangeEvent,
  memo,
  ReactElement,
  JSXElementConstructor,
  SyntheticEvent,
} from "react";

import { validateFilterInput, validateFilterRangeInput } from "@methods/validators/filterValidator";

import { InputNumberArrows } from "./inputNumberArrows";

interface IFilterOffersInterface {
  title: string;
  titleComponent?: ReactNode;
  customComponent?: ReactNode;
  type: "single" | "multi" | "minmax" | "custom";
  action?: (value: string) => void;
  actionMin?: (value: number) => void;
  actionMax?: (value: number) => void;
  actionValidator?: number;
  actionValidatorMin?: number;
  actionValidatorMax?: number;
  values?: string[];
  valuesRange?: { min: number; max: number };
  items?: { label: string; value: string }[];
}

export const Filter = memo(
  ({
    title,
    titleComponent,
    customComponent,
    type,
    items,
    action,
    actionMin,
    actionMax,
    actionValidatorMin,
    actionValidatorMax,
    values,
    valuesRange,
  }: IFilterOffersInterface): ReactElement => {
    const [min, setMin] = useState<number>();
    const [max, setMax] = useState<number>();

    const debounce = (
      func: (val: number) => void,
      timeout = 400,
    ): ((...args: [number]) => void) => {
      let timer: NodeJS.Timeout;
      return (...args: [number]) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(window, args);
        }, timeout);
      };
    };

    const handleCheckedItem = (itemValue: string): boolean => {
      if (values) {
        return values.includes(itemValue);
      }
      return false;
    };

    const handleDevCollectionsLabels = (label: string): string => {
      if (label === "Dave test collection 2") {
        return "Dev Only 1";
      } else if (label === "Youtube") {
        return "Dev Only 2";
      } else {
        return label;
      }
    };

    const handleAction = useCallback(
      (event: SyntheticEvent<HTMLInputElement, Event>): void => {
        const inputValue = event.currentTarget.name;
        if (inputValue && validateFilterInput(inputValue) && action) {
          action(inputValue);
        }
      },
      [action],
    );

    const debounceMin = useCallback(
      debounce((val) => actionMin && actionMin(val)),
      [valuesRange],
    );
    const debounceMax = useCallback(
      debounce((val) => actionMax && actionMax(val)),
      [valuesRange],
    );

    const handleRangeAction = useCallback(
      (event: ChangeEvent<HTMLInputElement>): void => {
        const rangeType = event.target.name;
        const inputValue = parseFloat(event.target.value);
        rangeType === "min" ? setMin(inputValue) : setMax(inputValue);
        let actionValidator, isValid;
        if (rangeType === "min") {
          actionValidator = actionValidatorMin ? actionValidatorMin : 1;
          isValid = validateFilterRangeInput(inputValue, actionValidator, rangeType);
        } else {
          actionValidator = actionValidatorMax ? actionValidatorMax : 10000;
          isValid = validateFilterRangeInput(inputValue, actionValidator, rangeType);
        }

        if (rangeType === "min") {
          isValid ? debounceMin(inputValue) : debounceMin(actionValidator);
        } else {
          isValid ? debounceMax(inputValue) : debounceMax(actionValidator);
        }
      },
      [actionValidatorMax, actionValidatorMin, debounceMax, debounceMin],
    );

    const handleArrows = useCallback((arrowType: string, value: number): void => {
      if (arrowType === "min") {
        setMin(value);
        debounceMin(value);
      } else {
        setMax(value);
        debounceMax(value);
      }
    }, []);

    const renderList = (): ReactNode => {
      const data =
        items && items.length && action
          ? items.map((item) => (
              <li key={`filter-item--${item.value}`}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name={item.value}
                    defaultChecked={handleCheckedItem(item.value)}
                    onChange={handleAction}
                  />
                  <span className="checkbox-custom rectangular" />
                </label>
                <div className="input-title">{handleDevCollectionsLabels(item.label)}</div>
              </li>
            ))
          : "";

      return (
        <div className="filter-generic">
          <div className="filter-generic__top">
            <h5>{title}</h5>
          </div>
          <ul>{data}</ul>
        </div>
      );
    };

    const renderMinMax = (): ReactNode => {
      return valuesRange && actionMin && actionMax ? (
        <div className="filter-generic">
          <div className="filter-generic__top">
            <h5>{title}</h5>
            {titleComponent ? titleComponent : ""}
          </div>
          <div className="filter-minmax">
            <div className="filter-line">
              <span>Min: </span>
              <input
                className="min"
                name="min"
                type="number"
                value={min || ""}
                onChange={handleRangeAction}
              />
              <InputNumberArrows arrowType="min" value={min ? min : 0} onChange={handleArrows} />
            </div>
            <div className="filter-line">
              <span>Max: </span>
              <input
                className="max"
                name="max"
                type="number"
                value={max || ""}
                onChange={handleRangeAction}
              />
              <InputNumberArrows arrowType="max" value={max ? max : 0} onChange={handleArrows} />
            </div>
          </div>
        </div>
      ) : (
        <div />
      );
    };

    const renderCustom = (): ReactNode => {
      return (
        <div className="filter-generic">
          <div className="filter-generic__top">
            <h5>{title}</h5>
            {titleComponent ? titleComponent : ""}
          </div>
          {customComponent}
        </div>
      );
    };

    const renderFilterByType = (): ReactNode => {
      if ((type === "single" || type === "multi") && items && Array.isArray(items)) {
        return renderList();
      } else if (type === "minmax") {
        return renderMinMax();
      } else if (type === "custom") {
        return renderCustom();
      } else return <div />;
    };

    return renderFilterByType() as ReactElement<any, string | JSXElementConstructor<any>>;
  },
);
