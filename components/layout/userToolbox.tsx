import { observer } from "mobx-react";
import { MenuShowButton } from "./menuShowButton";
import { WalletCustomButton } from "@components/walletButton/WalletCustomButton";

interface UserToolboxProps {
  isMenuHidden: boolean | undefined;
  hideMenu: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}

export const UserToolbox = observer(({ hideMenu, isMenuHidden }: UserToolboxProps) => {
  return (
    <div className="user-toolbox">
      <MenuShowButton
        menuVisibleState={isMenuHidden ? isMenuHidden : false}
        changeMenuVisibility={hideMenu ? hideMenu : undefined}
      />
      <WalletCustomButton />
      <div className="user-toolbox__fake"></div>
    </div>
  );
});
