import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";

const ConnectWallet: React.FC = () => {
  return (
    <div className="connect-wallet-modal">
      <p className="connect-info">You have to select your wallet to see offers</p>
      <WalletMultiButton />
    </div>
  );
};

export default ConnectWallet;
