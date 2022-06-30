import { useContext, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { observer } from "mobx-react";
import axios from "axios";

import { StoreContext } from "@pages/_app";

import { initLoanProgram } from "@integration/nftLoan";
import { errorCase } from "@methods/toast-error-handler";
import { useAccountChange } from "@hooks/useAccountChange";

type Props = {
  children?: ReactNode;
};

export const StoreDataAdapter = observer(({ children }: Props) => {
  const { wallet, connected, disconnect, publicKey } = useWallet();
  const store = useContext(StoreContext);

  const [onAccountChange, accountChangeDestructor] = useAccountChange();

  useEffect(() => {
    const setWallet = async (): Promise<void> => {
      if (connected && wallet && publicKey) {
        const response = await axios.post("/api/auth", { user: publicKey.toBase58() });

        if (!(response && response.data)) return;

        const { isWhitelisted } = response.data;

        if (!isWhitelisted) {
          errorCase("You are not whitelisted!");
          disconnect();
          return;
        }

        await onAccountChange();

        initLoanProgram(wallet.adapter);
        store.GlobalState.fetchGlobalState();
        store.Wallet.setConnected(connected);
        store.Wallet.setWallet(wallet);
        store.Wallet.setHandleDisconnect(disconnect);
        store.Wallet.setWalletKey(publicKey);
      }
    };

    setWallet();

    return accountChangeDestructor;
  }, [wallet, connected, store.Wallet]);

  return <>{children}</>;
});
