import { memo } from "react";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const ConnectWallet = memo(() => {
  return (
    <div className="connect-wallet-modal">
      <p className="connect-info">You have to select your wallet to see offers</p>
      <WalletMultiButton />
    </div>
  );
});
