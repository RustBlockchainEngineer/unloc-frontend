import { Dispatch, SetStateAction } from "react";

import { observer } from "mobx-react-lite";
import { MenuShowButton } from "./menuShowButton";
import { WalletCustomButton } from "@components/walletButton/WalletCustomButton";

interface UserToolboxProps {
  isMenuHidden: boolean | undefined;
  hideMenu: Dispatch<SetStateAction<boolean>> | undefined;
}

export const UserToolbox = observer(({ hideMenu, isMenuHidden }: UserToolboxProps) => {
  return (
    <div className="user-toolbox">
      <MenuShowButton
        menuVisibleState={isMenuHidden ? isMenuHidden : false}
        changeMenuVisibility={hideMenu ? hideMenu : undefined}
      />
      <WalletCustomButton />
    </div>
  );
});
