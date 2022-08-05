import { useContext, useEffect, useState } from "react";

import { observer } from "mobx-react";
import { NFTMetadata } from "@integration/nftLoan";
import { StoreContext } from "@pages/_app";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { CollateralItem } from "./collateralItem";
import { BlobLoader } from "@components/layout/blobLoader";
import { CustomSelect } from "@components/layout/customSelect";
import { errorCase, successCase } from "@methods/toast-error-handler";
import { createSetOfferInstruction } from "@unloc-dev/unloc-loan-solita";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { DEFAULT_PROGRAMS, METADATA, NFT_LOAN_PID, OFFER_TAG } from "@constants/config";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const CreateCollateral = observer(() => {
  const store = useContext(StoreContext);
  const { connection } = useConnection();
  const { publicKey: walletKey, sendTransaction } = useWallet();
  const myOffers = store.MyOffers;
  // const { wallet, connection, walletKey } = store.Wallet;

  const [itemMint, setItemMint] = useState("");
  const [sortOption, setSortOption] = useState("Default");
  const [data, setData] = useState<NFTMetadata[]>(myOffers.collaterables);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const chooseNFT = (mint: any) => {
    if (mint === itemMint) {
      setItemMint("");
    } else {
      setItemMint(mint);
    }
  };

  const sortNFT = (option: string) => {
    setSortOption(option);
  };

  const createOffer = async (mint: string) => {
    try {
      if (!walletKey) {
        throw new Error("Connect your wallet!");
      }

      store.Lightbox.setCanClose(false);
      setProcessing(true);

      const nftMint = new PublicKey(mint);
      const userVault = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        nftMint,
        walletKey,
      );
      const nftMetadata = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METADATA.toBuffer(), nftMint.toBuffer()],
        METADATA,
      )[0];
      const edition = PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METADATA.toBuffer(), nftMint.toBuffer(), Buffer.from("edition")],
        METADATA,
      )[0];
      const offer = PublicKey.findProgramAddressSync(
        [Buffer.from(OFFER_TAG), walletKey.toBuffer(), nftMint.toBuffer()],
        NFT_LOAN_PID,
      )[0];

      const ix = createSetOfferInstruction(
        {
          borrower: walletKey,
          nftMint,
          payer: walletKey,
          nftMetadata,
          edition,
          userVault,
          offer,
          ...DEFAULT_PROGRAMS,
        },
        NFT_LOAN_PID,
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: walletKey,
        ...latestBlockhash,
      }).add(ix);

      const signature = await sendTransaction(tx, connection);
      console.log(signature);
      await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");

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

    store.MyOffers.refetchStoreData();
  };

  useEffect(() => {
    if (data) {
      if (sortOption === "") {
        return;
      }

      if (sortOption.toLowerCase() === "name") {
        setData(
          data.sort((a, b) =>
            a.arweaveMetadata.name > b.arweaveMetadata.name
              ? 1
              : b.arweaveMetadata.name > a.arweaveMetadata.name
              ? -1
              : 0,
          ),
        );
      }
    }
  }, [sortOption]);

  useEffect(() => {
    if (walletKey) {
      const fetchData = async () => {
        try {
          setLoading(true);
          await myOffers.getUserNFTs(walletKey);
          await myOffers.getNFTsData();
          setData(myOffers.collaterables);
        } catch (e: any) {
          errorCase(e);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [connection, walletKey]);

  return processing ? (
    <div className="create-offer-processing">
      <BlobLoader />
      <span>Processing Transaction</span>
    </div>
  ) : (
    <StoreDataAdapter>
      <div className="collateral-lightbox">
        {!loading ? (
          data && data.length ? (
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
                {data?.map((item: NFTMetadata) => {
                  return (
                    <CollateralItem
                      key={item.mint}
                      data={item}
                      onClick={() => chooseNFT(item.mint)}
                      choosen={item.mint === itemMint}
                    />
                  );
                })}
              </div>
              <button
                onClick={() => {
                  createOffer(itemMint);
                }}
                className="lb-collateral-button">
                Use as Collateral
              </button>
            </>
          ) : (
            <div className="collateral-empty">
              <div />
              <h2>No whitelisted NFTs in your wallet</h2>
            </div>
          )
        ) : (
          <div className="collateral-loading">
            <BlobLoader />
            <h2>Loading...</h2>
          </div>
        )}
      </div>
    </StoreDataAdapter>
  );
});
