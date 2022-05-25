import { useContext, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { SwitchButton } from "./switchButton";
import { MenuShowButton } from "./menuShowButton";

interface UserToolboxProps {
  isMenuHidden: boolean;
  hideMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserToolbox = observer(({hideMenu, isMenuHidden}:UserToolboxProps) => {
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

      <MenuShowButton menuVisibleState={isMenuHidden} changeMenuVisibility={hideMenu} />
      <WalletMultiButton />
      <div className="theme-switcher">
        <SwitchButton
          state={store.Interface.theme == "light"}
          classNames={"theme-switcher--switch"}
          onClick={handleThemeSet}
        />
      </div>

    </div>
  );
});
