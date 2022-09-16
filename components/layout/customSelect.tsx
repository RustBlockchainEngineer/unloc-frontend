import React, { useState, useEffect, SyntheticEvent } from "react";

interface CustomSelectProps {
  classNames?: string;
  options: string[];
  defaultOption?: string;
  selectedOption: string;
  disabled?: boolean;
  setSelectedOption: (option: string) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  disabled,
  classNames,
  options,
  defaultOption,
  selectedOption,
  setSelectedOption,
}: CustomSelectProps) => {
  const [hidden, setHidden] = useState(true);

  const handleHideOptions = (e: MouseEvent) => {
    if (disabled) {
      return;
    }

    const element = e.target as HTMLElement;

    if (element.offsetParent && element.offsetParent.classList.contains("custom-select")) {
      return;
    }

    setHidden(true);
  };

  const handleVisibilityForOptions = (event?: SyntheticEvent<HTMLButtonElement, Event>): void => {
    event?.preventDefault();
    if (disabled) {
      return;
    }

    setHidden(!hidden);
  };

  const handleSelectOption = (option: string) => {
    if (disabled) {
      return;
    }

    setSelectedOption(option);
    handleVisibilityForOptions();
  };

  useEffect(() => {
    window.addEventListener("click", handleHideOptions);

    return () => {
      window.removeEventListener("click", handleHideOptions);
    };
  });

  return (
    <div className={`custom-select ${classNames} ${disabled ? "disabled" : ""}`}>
      <button className="custom-select__selected" onClick={handleVisibilityForOptions}>
        {selectedOption || defaultOption}
        <i className="icon icon--sm icon--rnd--triangle--down" />
      </button>
      <ul className={`custom-select__options ${hidden ? "hidden" : ""}`}>
        {options.map((option) => (
          <li
            key={option}
            className={option === selectedOption ? "selected" : ""}
            onClick={() => handleSelectOption(option)}>
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
};
