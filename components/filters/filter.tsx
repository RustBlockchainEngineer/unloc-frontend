import {
  ReactNode,
  useRef,
  useCallback,
  ChangeEvent,
  memo,
  ReactElement,
  JSXElementConstructor,
  SyntheticEvent,
} from "react";

import { validateFilterInput, validateFilterRangeInput } from "@utils/validators/filterValidator";

import { InputNumberArrows } from "./inputNumberArrows";

interface IFilterOffersInterface {
  title: string;
  titleComponent?: ReactNode;
  customComponent?: ReactNode;
  type: "single" | "multi" | "minmax" | "custom";
  minRef?: React.MutableRefObject<HTMLInputElement | null>;
  maxRef?: React.MutableRefObject<HTMLInputElement | null>;
  action?: (value: string) => void;
  actionMin?: (value: number) => void;
  actionMax?: (value: number) => void;
  actionValidator?: number;
  actionValidatorMin?: number;
  actionValidatorMax?: number;
  values?: string[];
  valuesRange?: { min: number; max: number };
  items?: Array<{ label: string; value: string }>;
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
    minRef,
    maxRef,
  }: IFilterOffersInterface) => {
    const localMinRef = minRef != null || useRef<HTMLInputElement>(null);
    const localMaxRef = maxRef != null || useRef<HTMLInputElement>(null);

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
      if (values != null) return values.includes(itemValue);

      return false;
    };

    const handleDevCollectionsLabels = (label: string): string => {
      if (label === "Dave test collection 2") return "Dev Only 1";
      else if (label === "Youtube") return "Dev Only 2";
      else return label;
    };

    const handleAction = useCallback(
      (event: SyntheticEvent<HTMLInputElement, Event>): void => {
        const inputValue = event.currentTarget.name;
        if (inputValue !== "" && validateFilterInput(inputValue) && action != null)
          action(inputValue);
      },
      [action],
    );

    const debounceMin = useCallback(
      debounce((val) => actionMin?.(val)),
      [valuesRange],
    );

    const debounceMax = useCallback(
      debounce((val) => actionMax?.(val)),
      [valuesRange],
    );

    const handleRangeAction = useCallback(
      (event: ChangeEvent<HTMLInputElement>): void => {
        const rangeType = event.target.name;
        const inputValue = parseFloat(event.target.value);

        if (rangeType === "min" && typeof localMinRef !== "boolean" && localMinRef.current != null)
          localMinRef.current.value = inputValue !== 0 ? inputValue.toString() : "";
        else if (typeof localMaxRef !== "boolean" && localMaxRef.current != null)
          localMaxRef.current.value = inputValue !== 0 ? inputValue.toString() : "";

        let actionValidator, isValid;
        if (rangeType === "min") {
          actionValidator = actionValidatorMin != null || 1;
          isValid = validateFilterRangeInput(inputValue, actionValidator as number, rangeType);
        } else {
          actionValidator = actionValidatorMax != null || 10000;
          isValid = validateFilterRangeInput(inputValue, actionValidator as number, rangeType);
        }

        if (rangeType === "min")
          isValid ? debounceMin(inputValue) : debounceMin(actionValidator as number);
        else isValid ? debounceMax(inputValue) : debounceMax(actionValidator as number);
      },
      [actionValidatorMax, actionValidatorMin, debounceMax, debounceMin],
    );

    const handleArrows = useCallback((arrowType: string, value: number): void => {
      if (arrowType === "min" && typeof localMinRef !== "boolean" && localMinRef.current != null) {
        localMinRef.current.value = value !== 0 ? value.toString() : "";
        debounceMin(value);
      } else if (typeof localMaxRef !== "boolean" && localMaxRef.current != null) {
        localMaxRef.current.value = value !== 0 ? value.toString() : "";
        debounceMax(value);
      }
    }, []);

    const renderList = (): ReactNode => {
      const data =
        items != null && items.length > 0 && action != null
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
      return valuesRange != null && actionMin != null && actionMax != null ? (
        <div className="filter-generic">
          <div className="filter-generic__top">
            <h5>{title}</h5>
            {titleComponent !== null || ""}
          </div>
          <div className="filter-minmax">
            <div className="filter-line">
              <span>Min: </span>
              <input
                className="min"
                ref={minRef}
                name="min"
                type="number"
                onChange={handleRangeAction}
              />
              <InputNumberArrows
                arrowType="min"
                value={
                  typeof localMinRef !== "boolean" && localMinRef.current != null
                    ? Number(localMinRef.current.value)
                    : 0
                }
                onChange={handleArrows}
              />
            </div>
            <div className="filter-line">
              <span>Max: </span>
              <input
                className="max"
                ref={maxRef}
                name="max"
                type="number"
                onChange={handleRangeAction}
              />
              <InputNumberArrows
                arrowType="max"
                value={
                  typeof localMaxRef !== "boolean" && localMaxRef.current != null
                    ? Number(localMaxRef.current.value)
                    : 0
                }
                onChange={handleArrows}
              />
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
            {titleComponent !== null || ""}
          </div>
          {customComponent}
        </div>
      );
    };

    const renderFilterByType = (): ReactNode => {
      if ((type === "single" || type === "multi") && items != null && Array.isArray(items))
        return renderList();
      else if (type === "minmax") return renderMinMax();
      else if (type === "custom") return renderCustom();
      else return <div />;
    };

    return renderFilterByType() as ReactElement<any, string | JSXElementConstructor<any>>;
  },
);
