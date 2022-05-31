import { useContext, useEffect } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { SwitchButton } from "./switchButton";
import { MenuShowButton } from "./menuShowButton";
import { WalletCustomButton } from "@components/walletButton/WalletCustomButton";

interface UserToolboxProps {
  isMenuHidden: boolean | undefined;
  hideMenu: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}

export const UserToolbox = observer(({ hideMenu, isMenuHidden }: UserToolboxProps) => {
  const store = useContext(StoreContext);
  const { theme } = store.Interface;

  const handleThemeSet = () => {
    store.Interface.setTheme(theme === "dark" ? "light" : "dark");
    localStorage.setItem("unloc-theme", theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("unloc-theme");
    if (savedTheme && savedTheme.length && (savedTheme === "dark" || savedTheme === "light")) {
      store.Interface.setTheme(savedTheme);
    }
  });

  return (
    <div className="user-toolbox">
      <MenuShowButton
        menuVisibleState={isMenuHidden ? isMenuHidden : false}
        changeMenuVisibility={hideMenu ? hideMenu : undefined}
      />
      <WalletCustomButton />
      <div className="theme-switcher">
        <SwitchButton
          state={store.Interface.theme == "light"}
          classNames={"theme-switcher--switch"}
          onClick={handleThemeSet}
          theme={true}
        />
      </div>
    </div>
  );
});
