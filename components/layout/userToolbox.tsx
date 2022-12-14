import { Dispatch, SetStateAction } from "react";

import { observer } from "mobx-react-lite";

import { WalletCustomButton } from "@components/walletButton/WalletCustomButton";

import { MenuShowButton } from "./menuShowButton";

interface UserToolboxProps {
  isMenuHidden: boolean | undefined;
  hideMenu: Dispatch<SetStateAction<boolean>> | undefined;
}

export const UserToolbox = observer(({ hideMenu, isMenuHidden }: UserToolboxProps) => {
  return (
    <div className="user-toolbox">
      <MenuShowButton
        menuVisibleState={isMenuHidden ?? false}
        changeMenuVisibility={hideMenu != null ? hideMenu : undefined}
      />
      <WalletCustomButton />
    </div>
  );
});
