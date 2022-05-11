import React, { useState } from "react";

interface ShowOnHoverProps {
  label: React.ReactNode;
  children: React.ReactNode;
  labelClassName?: string;
  classNames?: string;
}

export const ShowOnHover: React.FC<ShowOnHoverProps> = ({
  label,
  children,
  labelClassName,
  classNames = "",
}: ShowOnHoverProps) => {
  const [hoverState, setHoverState] = useState(false);

  const handleHover = () => {
    setHoverState(true);
  };

  const handleLeave = () => {
    setHoverState(false);
  };

  return (
    <div
      className={`show-on-hover ${classNames}`}
      onMouseOver={() => handleHover()}
      onMouseLeave={() => handleLeave()}>
      <div className={`show-on-hover__label ${labelClassName ? labelClassName : ""}`}>{label}</div>
      <div className={`show-on-hover__elements ${hoverState ? "active" : ""}`}>
        <div className="show-on-hover__elements__wrap">{children}</div>
      </div>
    </div>
  );
};
