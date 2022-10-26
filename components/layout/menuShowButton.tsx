import { Dispatch, SetStateAction } from "react";

interface MenuShowButtonProps {
  menuVisibleState: boolean;
  changeMenuVisibility: Dispatch<SetStateAction<boolean>> | undefined;
}

export const MenuShowButton = ({
  menuVisibleState,
  changeMenuVisibility,
}: MenuShowButtonProps): JSX.Element => {
  return (
    <div
      className="menu-show-button mobile-only"
      onClick={() => (changeMenuVisibility != null ? changeMenuVisibility(!menuVisibleState) : "")}>
      <div className={`menu-show-button-hamburger ${menuVisibleState ? "clicked" : ""}`}>
        <div className="menu-show-button-hamburger_strips">
          <div className="strip" />
          <div className="strip" />
          <div className="strip" />
        </div>
      </div>
    </div>
  );
};
