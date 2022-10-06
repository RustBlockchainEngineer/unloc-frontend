import { useContext, useEffect, ReactNode } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { observer } from "mobx-react-lite";
import axios from "axios";

import { StoreContext } from "@pages/_app";

import { errorCase } from "@utils/toast-error-handler";
import { useAccountChange } from "@hooks/useAccountChange";

type Props = {
  children?: ReactNode;
};

export const StoreDataAdapter = observer(({ children }: Props) => {
  const { wallet, disconnect, publicKey } = useWallet();
  const { connection } = useConnection();
  const store = useContext(StoreContext);

  const [onAccountChange, accountChangeDestructor] = useAccountChange();

  useEffect(() => {
    const setWallet = async (): Promise<void> => {
      if (wallet && publicKey) {
        const response = await axios.post("/api/auth", { user: publicKey.toBase58() });

        if (!(response && response.data)) return;

        const { isWhitelisted } = response.data;

        if (!isWhitelisted) {
          errorCase("You are not whitelisted!");
          disconnect();
          return;
        }

        await onAccountChange();

        store.Wallet.setWalletKey(publicKey);
        store.Wallet.setWallet(wallet);
        store.Wallet.setConnection(connection);
        await store.GlobalState.fetchGlobalState(connection);
      }
    };

    setWallet();

    return accountChangeDestructor;
  }, [wallet, publicKey, connection]);

  return <>{children}</>;
});
