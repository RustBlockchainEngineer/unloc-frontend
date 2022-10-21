import { useCallback, useContext, useEffect, useState, RefObject } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { StoreContext } from "@pages/_app";
import { observer } from "mobx-react-lite";
import { SwitchButton } from "@components/layout/switchButton";
import { CustomSelect } from "@components/layout/customSelect";
import { config, formatOptions } from "@constants/config";
import { Commitment } from "@solana/web3.js";

interface DropdownListProps {
  refer: RefObject<HTMLUListElement>;
  active: boolean;
  base58: string;
  openModal: () => void;
}

export const DropdownList = observer(({ refer, active, openModal, base58 }: DropdownListProps) => {
  const store = useContext(StoreContext);
  const { solAmount, usdcAmount, unlocAmount } = store.Wallet;
  const { disconnect } = useWallet();
  const { theme } = store.Interface;
  const [copied, setCopied] = useState(false);

  const { endpoint, endpoints } = store.GlobalState;
  const switchEndpoint = (endpointString: string): void => {
    store.GlobalState.setEndpoint(endpointString);
    localStorage.setItem("endpoint", endpointString);
  };

  const handleThemeSet = () => {
    store.Interface.setTheme(theme === "dark" ? "light" : "dark");
    localStorage.setItem("unloc-theme", theme === "dark" ? "light" : "dark");
  };

  const { selectedCommitment, commitmentLevels } = store.GlobalState;
  const commitmentLevelHandler = (level: Commitment | string): void => {
    store.GlobalState.setCommitment(level as Commitment);
    localStorage.setItem("commitment_level", level);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("unloc-theme");
    if (savedTheme && savedTheme.length && (savedTheme === "dark" || savedTheme === "light")) {
      store.Interface.setTheme(savedTheme);
    }
  });

  useEffect(() => {
    const storedEndpoint = localStorage.getItem("endpoint");
    const storedCommitmentLevel = localStorage.getItem("commitment_level");
    if (storedEndpoint) store.GlobalState.setEndpoint(storedEndpoint);
    else localStorage.setItem("endpoint", endpoint);
    if (storedCommitmentLevel) store.GlobalState.setCommitment(storedCommitmentLevel as Commitment);
    else localStorage.setItem("commitment_level", selectedCommitment);
  }, []);

  const copyAddress = useCallback(async (): Promise<void> => {
    if (base58) {
      await navigator.clipboard.writeText(base58);
      setCopied(true);
      setTimeout((): void => setCopied(false), 400);
    }
  }, [base58]);

  return (
    <ul
      aria-label="dropdown-list"
      className={`wallet-adapter-dropdown-list ${active && "wallet-adapter-dropdown-list-active"}`}
      ref={refer}
      role="menu">
      <li onClick={copyAddress} className="wallet-adapter-dropdown-list-item hover" role="menuitem">
        <i className="icon icon--sm icon--copy" />
        {copied ? "Copied" : "Copy address"}
        <i className="icon icon--sm icon--fake" />
      </li>
      <li onClick={openModal} className="wallet-adapter-dropdown-list-item hover" role="menuitem">
        <i className="icon icon--sm icon--switch" />
        Change wallet
        <i className="icon icon--sm icon--fake" />
      </li>
      <li onClick={disconnect} className="wallet-adapter-dropdown-list-item hover" role="menuitem">
        <i className="icon icon--sm icon--disconnect" />
        Disconnect
        <i className="icon icon--sm icon--fake" />
      </li>
      <span className="wallet-adapter-dropdown-list-item divider" />
      <li className="wallet-adapter-dropdown-list-item balance">Wallet Balance</li>
      <li className="wallet-adapter-dropdown-list-item balance__item balance__item--solana">
        <i className="icon icon--sm icon--fake" />
        {solAmount.toLocaleString(undefined, formatOptions)}
        <i className="icon icon--sm icon--currency--SOL" />
      </li>
      <li className="wallet-adapter-dropdown-list-item balance__item balance__item--usdc">
        <i className="icon icon--sm icon--fake" />
        {usdcAmount.toLocaleString(undefined, formatOptions)}
        <i className="icon icon--sm icon--currency--USDC" />
      </li>
      {config.devnet && (
        <li className="wallet-adapter-dropdown-list-item balance__item balance__item--unloc">
          <i className="icon icon--sm icon--fake" />
          {unlocAmount.toLocaleString(undefined, formatOptions)}
          <i className="icon icon--sm icon--currency--UNLOC" />
        </li>
      )}
      <span className="wallet-adapter-dropdown-list-item divider" />
      <li className="wallet-adapter-dropdown-list-item theme" role="menuitem">
        Select theme
        <SwitchButton
          state={theme == "light"}
          classNames={"theme-switcher--switch"}
          onClick={handleThemeSet}
          theme={true}
        />
      </li>
      <span className="wallet-adapter-dropdown-list-item divider" />
      <li className="wallet-adapter-dropdown-list-item endpoint" role="menuitem">
        Select endpoint
        <CustomSelect
          classNames="wallet-endpoint-select"
          options={endpoints}
          selectedOption={endpoint}
          setSelectedOption={switchEndpoint}
        />
      </li>
      <li className="wallet-adapter-dropdown-list-item endpoint" role="menuitem">
        Set commitment
        <CustomSelect
          classNames="wallet-endpoint-select"
          options={commitmentLevels}
          selectedOption={selectedCommitment}
          setSelectedOption={commitmentLevelHandler}
        />
      </li>
    </ul>
  );
});
