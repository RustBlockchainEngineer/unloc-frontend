interface InputNumberArrowsInterface {
  value: number;
  onChange: (value: number) => void;
}

export const InputNumberArrows = ({ value, onChange }: InputNumberArrowsInterface) => {
  return (
    <div className="input--number--buttons">
      <div
        className="input--number--buttons_up"
        onClick={() => {
          onChange(value + 1);
        }}>
        <i className={"icon icon--vs filter--icon icon--rnd--triangle--up"} />
      </div>
      <div
        className="input--number--buttons_down"
        onClick={() => {
          onChange(value - 1);
        }}>
        <i className={"icon icon--vs filter--icon icon--rnd--triangle--down"} />
      </div>
    </div>
  );
};
