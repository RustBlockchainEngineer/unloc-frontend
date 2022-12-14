import { useState, ReactNode } from "react";

interface ShowOnHoverProps {
  label: ReactNode;
  children?: ReactNode;
  labelClassName?: string;
  classNames?: string;
}

export const ShowOnHover = ({
  label,
  children,
  labelClassName,
  classNames = "",
}: ShowOnHoverProps): JSX.Element => {
  const [hoverState, setHoverState] = useState(false);

  const handleHover = (): void => {
    setHoverState(true);
  };

  const handleLeave = (): void => {
    setHoverState(false);
  };

  return (
    <div
      className={`on-hover ${classNames}`}
      onMouseOver={() => handleHover()}
      onMouseLeave={() => handleLeave()}>
      <p className={`on-hover__label ${labelClassName ?? ""}`}>{label}</p>
      <div className={`on-hover__elements ${hoverState ? "active" : ""}`}>
        <div className="on-hover__elements__wrap">{children}</div>
      </div>
    </div>
  );
};
