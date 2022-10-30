import { useContext, useMemo, useState } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { observer } from "mobx-react-lite";
import useSWR from "swr";

import { CustomSelect } from "@components/layout/customSelect";
import { SkeletonRectangle } from "@components/skeleton/rectangle";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { useSendTransaction } from "@hooks/useSendTransaction";
import { StoreContext } from "@pages/_app";
import { fetchWhitelistedUserNfts } from "@utils/spl/metadata";
import { createLoanOffer } from "@utils/spl/unloc-loan";
import { errorCase, successCase } from "@utils/toast-error-handler";

import { CircleProcessing } from "../circleProcessing";

import { CollateralItem } from "./collateralItem";

export const CreateCollateral = observer(() => {
  const store = useContext(StoreContext);
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();

  const { data, error } = useSWR([connection, wallet], fetchWhitelistedUserNfts, {
    refreshInterval: 20000,
  });
  const loading = useMemo(() => data == null && !error, [data, error]);
  const [selectedMint, setSelectedMint] = useState<PublicKey | null>(null);
  const [sortOption, setSortOption] = useState("Default");
  const [processing, setProcessing] = useState(false);

  const chooseNFT = (mint: PublicKey): void => {
    if (selectedMint?.equals(mint)) setSelectedMint(null);
    else setSelectedMint(mint);
  };

  const sortNFT = (option: string): void => {
    setSortOption(option);
  };

  const handleDepositNft = async (): Promise<void> => {
    try {
      if (wallet == null) throw new Error("Connect your wallet!");

      if (selectedMint == null) throw new Error("Select an NFT");

      store.Lightbox.setCanClose(false);
      setProcessing(true);

      const tx = await createLoanOffer(connection, wallet, selectedMint);
      await sendAndConfirm(tx);
      store.MyOffers.setActiveCategory("deposited");

      store.Lightbox.setVisible(false);
      setProcessing(false);
      store.Lightbox.setCanClose(true);

      successCase("Collateral Created");
    } catch (e: any) {
      errorCase(e);
    } finally {
      setProcessing(false);
      store.Lightbox.setVisible(false);
    }

    await store.MyOffers.refetchStoreData();
  };

  if (processing) return <CircleProcessing />;

  return (
    <StoreDataAdapter>
      <div className="collateral-lightbox">
        {data != null && data.length === 0 && (
          <div className="collateral-empty">
            <div />
            <h2>No whitelisted NFTs in your wallet</h2>
          </div>
        )}
        {loading && <SkeletonRectangle offerType="wallet" />}
        {data != null && (
          <>
            <div className="NFT-lb-header">
              <h1>Choose an NFT for collateral</h1>
              <label htmlFor="sort-select">
                Sort by:
                <CustomSelect
                  options={["Default", "Name"]}
                  selectedOption={sortOption}
                  setSelectedOption={sortNFT}
                  classNames={"sort-select"}
                />
              </label>
            </div>
            <div className="NFT-lb-collateral-list">
              {data.map((item) => {
                return (
                  <CollateralItem
                    key={item.mint.toBase58()}
                    metadata={item}
                    onClick={() => chooseNFT(item.mint)}
                    chosen={selectedMint?.equals(item.mint) ?? false}
                  />
                );
              })}
            </div>
            <button onClick={handleDepositNft} className="lb-collateral-button">
              Use as Collateral
            </button>
          </>
        )}
      </div>
    </StoreDataAdapter>
  );
});
