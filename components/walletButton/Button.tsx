import { CSSProperties, MouseEvent, ReactNode, memo } from "react";

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
  style?: CSSProperties;
  tabIndex?: number;
  children?: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const Button = memo(({ ...props }: ButtonProps) => {
  return (
    <button
      className={`wallet-adapter-button ${props.className || ""}`}
      disabled={props.disabled}
      onClick={props.onClick}
      tabIndex={props.tabIndex || 0}
      type="button">
      {props.startIcon && <i className="wallet-adapter-button-start-icon">{props.startIcon}</i>}
      {props.children}
      {props.endIcon && <i className="wallet-adapter-button-end-icon">{props.endIcon}</i>}
    </button>
  );
});
