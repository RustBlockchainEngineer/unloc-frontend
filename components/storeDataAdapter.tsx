import { useContext, useEffect, ReactNode } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { observer } from "mobx-react-lite";

import { useAccountChange } from "@hooks/useAccountChange";
import { StoreContext } from "@pages/_app";
import { errorCase } from "@utils/toast-error-handler";

interface Props {
  children?: ReactNode;
}

export const StoreDataAdapter = observer(({ children }: Props) => {
  const { wallet, disconnect, publicKey } = useWallet();
  const { connection } = useConnection();
  const store = useContext(StoreContext);

  const [onAccountChange, accountChangeDestructor] = useAccountChange();

  useEffect(() => {
    const setWallet = async (): Promise<void> => {
      if (wallet != null && publicKey != null) {
        const response = await axios.post("/api/auth", { user: publicKey.toBase58() });

        if (!response?.data) return;

        const { isWhitelisted } = response.data;

        if (!isWhitelisted) {
          errorCase("You are not whitelisted!");
          void disconnect();
          return;
        }

        await onAccountChange();

        store.Wallet.setWalletKey(publicKey);
        store.Wallet.setWallet(wallet);
        store.Wallet.setConnection(connection);
        await store.GlobalState.fetchGlobalState(connection);
      }
    };

    void setWallet();

    return accountChangeDestructor;
  }, [wallet, publicKey, connection]);

  return <>{children}</>;
});
