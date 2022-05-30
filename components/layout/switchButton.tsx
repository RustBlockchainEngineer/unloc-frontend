import React from "react";
interface SwitchButtonInterface {
  state: boolean;
  onClick: (state: boolean) => void;
  classNames?: string;
  theme?: boolean;
}

export const SwitchButton = ({ state, onClick, classNames, theme }: SwitchButtonInterface) => {
  const onButtonClick = () => {
    onClick(!state);
  };

  return (
    <a className={`switch--button ${classNames}`} onClick={onButtonClick}>
      {theme && state ? <i className="icon icon--sm icon--theme icon--theme--moon" /> : ""}
      <div className={`switch--button--knob ${state ? "right" : "left"}`} />
      {theme && !state ? <i className="icon icon--sm icon--theme icon--theme--sun" /> : ""}
    </a>
  );
};
