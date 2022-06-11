import { useContext, useEffect, ReactNode } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { observer } from "mobx-react";

import { StoreContext } from "@pages/_app";

import { initLoanProgram } from "@integration/nftLoan";
import { config } from "@constants/config";
import { USDC_MINT_DEVNET, USDC_MINT } from "@constants/currency-constants";
import { errorCase } from "@methods/toast-error-handler";

type Props = {
  children?: ReactNode;
};

export const StoreDataAdapter = observer(({ children }: Props) => {
  const { wallet, connected, disconnect, publicKey } = useWallet();
  const store = useContext(StoreContext);
  const { connection } = useConnection();

  useEffect(() => {
    const accountChangeEventIds: number[] = [];

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

        const solChangeEventId = connection.onAccountChange(
          publicKey,
          async (): Promise<void> => await store.Wallet.fetchSolBalance(connection, publicKey),
        );

        accountChangeEventIds.push(solChangeEventId);

        const usdcTokenAccounts = (
          await connection.getTokenAccountsByOwner(publicKey, {
            mint: new PublicKey(config.devnet ? USDC_MINT_DEVNET : USDC_MINT),
          })
        ).value;

        for (const account of usdcTokenAccounts) {
          const usdcChangeEventId = connection.onAccountChange(
            account.pubkey,
            async (): Promise<void> => await store.Wallet.fetchUsdcBalance(connection, publicKey),
          );

          accountChangeEventIds.push(usdcChangeEventId);
        }

        initLoanProgram(wallet.adapter);
        store.GlobalState.fetchGlobalState();
        store.Wallet.setConnected(connected);
        store.Wallet.setWallet(wallet);
        store.Wallet.setHandleDisconnect(disconnect);
        store.Wallet.setWalletKey(publicKey as PublicKey);
        store.Wallet.fetchSolBalance(connection, publicKey);
        store.Wallet.fetchUsdcBalance(connection, publicKey);
      }
    };

    setWallet();

    return () => {
      for (const changeEventId of accountChangeEventIds) {
        connection.removeAccountChangeListener(changeEventId);
      }
    };
  }, [wallet, connected, store.Wallet]);

  return <>{children}</>;
});
