import { useState, useEffect, useContext } from "react";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { config } from "@constants/config";
import { currencies } from "@constants/currency";
import { USDC_MINT_DEVNET, USDC_MINT, UNLOC_MINT_DEVNET } from "@constants/currency-constants";
import { StoreContext } from "@pages/_app";

export const useAccountChange = (
  callback: (solAmount: number, usdcAmount: number, unlocAmount: number) => void = (
    _solAmount,
    _usdcAmount,
    _unlocAmount,
  ): void => {
    return;
  },
): [() => Promise<void>, () => void] => {
  const store = useContext(StoreContext);
  const [accountChangeEventIds, setAccountChangeEventIds] = useState<number[]>([]);
  const [solAmount, setSolAmount] = useState<number>(0);
  const [usdcAmount, setUsdcAmount] = useState<number>(0);
  const [unlocAmount, setUnlocAmount] = useState<number>(0);
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    () => callback(solAmount, usdcAmount, unlocAmount),
    [solAmount, usdcAmount, unlocAmount],
  );

  const fetchSolBalance = async (): Promise<void> => {
    if (!publicKey) return;

    const newSolAmount = await connection.getBalance(publicKey);
    setSolAmount(newSolAmount / 10 ** currencies.SOL.decimals);
    store.Wallet.setSolAmount(newSolAmount / 10 ** currencies.SOL.decimals);
  };

  const fetchUlocBalance = async (): Promise<void> => {
    if (!publicKey) return;

    let newUnlocAmount = 0;

    const unlocTokenAccounts = (
      await connection.getTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(UNLOC_MINT_DEVNET),
      })
    ).value;

    for (const account of unlocTokenAccounts) {
      const { uiAmount } = (await connection.getTokenAccountBalance(account.pubkey)).value;

      if (uiAmount === null) continue;

      newUnlocAmount += uiAmount;
    }

    setUnlocAmount(newUnlocAmount);
    store.Wallet.setUnlocAmount(newUnlocAmount);
  };

  const fetchUsdcBalance = async (): Promise<void> => {
    if (!publicKey) return;

    let newUsdcAmount = 0;

    const usdcTokenAccounts = (
      await connection.getTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(config.devnet ? USDC_MINT_DEVNET : USDC_MINT),
      })
    ).value;

    for (const account of usdcTokenAccounts) {
      const { uiAmount } = (await connection.getTokenAccountBalance(account.pubkey)).value;

      if (uiAmount === null) continue;

      newUsdcAmount += uiAmount;
    }

    setUsdcAmount(newUsdcAmount);
    store.Wallet.setUsdcAmount(newUsdcAmount);
  };

  const onAccountChange = async (): Promise<void> => {
    if (!publicKey) return;

    await fetchSolBalance();
    await fetchUsdcBalance();
    await fetchUlocBalance();

    const solChangeEventId = connection.onAccountChange(publicKey, () => void fetchSolBalance());

    setAccountChangeEventIds(accountChangeEventIds.concat(solChangeEventId));

    const usdcTokenAccounts = (
      await connection.getTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(config.devnet ? USDC_MINT_DEVNET : USDC_MINT),
      })
    ).value;

    for (const account of usdcTokenAccounts) {
      const usdcChangeEventId = connection.onAccountChange(
        account.pubkey,
        () => void fetchUsdcBalance(),
      );

      setAccountChangeEventIds(accountChangeEventIds.concat(usdcChangeEventId));
    }
  };

  const accountChangeDestructor = (): void => {
    const promises = accountChangeEventIds.map((changeEventId) =>
      connection.removeAccountChangeListener(changeEventId),
    );

    void Promise.all(promises);
  };

  return [onAccountChange, accountChangeDestructor];
};
