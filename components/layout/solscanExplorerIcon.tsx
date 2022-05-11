import React from "react";
import { config } from "@constants/config";

interface SolscanExplorerIconProps {
  type: "account" | "block" | "tx" | "token";
  address: string;
  classNames?: string;
}

export const SolscanExplorerIcon: React.FC<SolscanExplorerIconProps> = ({
  type,
  address,
  classNames,
}: SolscanExplorerIconProps) => {
  const handleOnClick = () => {
    window
      .open(
        `https://solscan.io/${type}/${address}?cluster=${config.devnet ? "devnet" : "mainnet"}`,
        "_blank",
      )
      ?.focus();
  };

  return (
    <i
      className={`icon icon--sm icon--eye icon--interactive ${classNames}`}
      onClick={() => handleOnClick()}
    />
  );
};
