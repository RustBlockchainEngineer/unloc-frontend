import { useContext, useMemo, useState } from "react";

import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { CollateralItem } from "./collateralItem";
import { BlobLoader } from "@components/layout/blobLoader";
import { CustomSelect } from "@components/layout/customSelect";
import { errorCase, successCase } from "@utils/toast-error-handler";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createOffer } from "@utils/spl/unloc-loan";
import { fetchWhitelistedUserNfts } from "@utils/spl/metadata";
import useSWR from "swr";
import { CircleProcessing } from "../circleProcessing";
import { useSendTransaction } from "@hooks/useSendTransaction";

export const CreateCollateral = observer(() => {
  const store = useContext(StoreContext);
  const { connection } = useConnection();
  const { publicKey: wallet } = useWallet();
  const sendAndConfirm = useSendTransaction();

  const { data, error } = useSWR([connection, wallet], fetchWhitelistedUserNfts, {
    refreshInterval: 20000,
  });
  const loading = useMemo(() => !data && !error, [data, error]);
  const [selectedMint, setSelectedMint] = useState<PublicKey | null>(null);
  const [sortOption, setSortOption] = useState("Default");
  const [processing, setProcessing] = useState(false);

  const chooseNFT = (mint: PublicKey) => {
    if (selectedMint?.equals(mint)) {
      setSelectedMint(null);
    } else {
      setSelectedMint(mint);
    }
  };

  const sortNFT = (option: string) => {
    setSortOption(option);
  };

  const handleDepositNft = async () => {
    try {
      if (!wallet) {
        throw new Error("Connect your wallet!");
      }
      if (!selectedMint) throw new Error("Select an NFT");

      store.Lightbox.setCanClose(false);
      setProcessing(true);

      const tx = createOffer(wallet, selectedMint);
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
        {loading && (
          <div className="collateral-loading">
            <BlobLoader />
            <h2>Loading...</h2>
          </div>
        )}
        {data && data.length === 0 && (
          <div className="collateral-empty">
            <div />
            <h2>No whitelisted NFTs in your wallet</h2>
          </div>
        )}
        {data && (
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
