import { useEffect, ReactNode } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import axios from "axios";
import { observer } from "mobx-react-lite";

import { useAccountChange } from "@hooks/useAccountChange";
import { useStore } from "@hooks/useStore";
import { errorCase } from "@utils/toast-error-handler";

interface Props {
  children?: ReactNode;
}

export const StoreDataAdapter = observer(({ children }: Props) => {
  const { wallet, disconnect, publicKey } = useWallet();
  const { connection } = useConnection();
  const { Wallet, GlobalState } = useStore();

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

        Wallet.setWalletKey(publicKey);
        Wallet.setWallet(wallet);
        Wallet.setConnection(connection);
        await GlobalState.fetchGlobalState(connection);
      }
    };

    void setWallet();

    return accountChangeDestructor;
  }, [wallet, publicKey, connection]);

  useEffect(() => {
    void getSolanaUnixTime(connection).then((unix) => {
      GlobalState.setTimer(unix);
    });

    const interval = setInterval(() => {
      GlobalState.increaseTimer();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [connection]);

  return <>{children}</>;
});

const getSolanaUnixTime = async (connection: Connection) => {
  const clockBuffer = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
  const unixTimestampBigInt = clockBuffer?.data.subarray(32, 40).readBigInt64LE();
  const unixTimestamp = Number(unixTimestampBigInt);
  return unixTimestamp;
};
