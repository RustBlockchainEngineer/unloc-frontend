import { memo, SyntheticEvent, useCallback } from "react";

interface IInputNumberArrowsInterface {
  arrowType: string;
  value: number;
  onChange: (type: string, value: number) => void;
}

type EventTargetNameProp = EventTarget & {
  name: string;
};

export const InputNumberArrows = memo(
  ({ arrowType, value, onChange }: IInputNumberArrowsInterface) => {
    const handler = useCallback(
      (event: SyntheticEvent<HTMLButtonElement, Event>): void => {
        // eslint-disable-next-line no-console
        console.log(event.currentTarget.name);
        (event.currentTarget as EventTargetNameProp)?.name === "up"
          ? onChange(arrowType, value + 1)
          : onChange(arrowType, value - 1);
      },
      [arrowType, onChange, value],
    );

    return (
      <div className="input--number--buttons">
        <button name="up" className="input--number--buttons_up" onClick={handler}>
          <i className="icon icon--vs filter--icon icon--rnd--triangle--up" />
        </button>
        <button name="down" className="input--number--buttons_down" onClick={handler}>
          <i className="icon icon--vs filter--icon icon--rnd--triangle--down" />
        </button>
      </div>
    );
  },
);
