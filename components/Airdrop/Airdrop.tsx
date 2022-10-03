import React from "react";
import { useState } from "react";
import { useConnection, useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { notify } from "./Notification";
import { config } from "@constants/config";
import BN from "bn.js";
import { createMintTransaction, findEditionPda, findNftMetadata } from "./utils";
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV2Instruction,
  createVerifyCollectionInstruction,
} from "@metaplex-foundation/mpl-token-metadata";

type SimpleMetadata = {
  name: string;
  symbol: string;
  tribe: string;
  uri: string;
  collection: string;
  collectionPK: Array<number>;
};
const airdropMetadata: SimpleMetadata[] = [
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 1",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK: [
      47, 189, 147, 2, 35, 185, 143, 206, 166, 235, 121, 127, 40, 93, 77, 119, 218, 145, 244, 150,
      137, 160, 216, 101, 52, 63, 167, 94, 29, 247, 100, 9, 6, 218, 165, 102, 171, 1, 147, 54, 252,
      194, 104, 184, 176, 181, 47, 128, 191, 35, 101, 142, 248, 78, 127, 51, 163, 185, 60, 116, 105,
      183, 199, 3,
    ],
  },
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 2",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK: [
      47, 189, 147, 2, 35, 185, 143, 206, 166, 235, 121, 127, 40, 93, 77, 119, 218, 145, 244, 150,
      137, 160, 216, 101, 52, 63, 167, 94, 29, 247, 100, 9, 6, 218, 165, 102, 171, 1, 147, 54, 252,
      194, 104, 184, 176, 181, 47, 128, 191, 35, 101, 142, 248, 78, 127, 51, 163, 185, 60, 116, 105,
      183, 199, 3,
    ],
  },
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 3",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK: [
      47, 189, 147, 2, 35, 185, 143, 206, 166, 235, 121, 127, 40, 93, 77, 119, 218, 145, 244, 150,
      137, 160, 216, 101, 52, 63, 167, 94, 29, 247, 100, 9, 6, 218, 165, 102, 171, 1, 147, 54, 252,
      194, 104, 184, 176, 181, 47, 128, 191, 35, 101, 142, 248, 78, 127, 51, 163, 185, 60, 116, 105,
      183, 199, 3,
    ],
  },
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 4",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK: [
      47, 189, 147, 2, 35, 185, 143, 206, 166, 235, 121, 127, 40, 93, 77, 119, 218, 145, 244, 150,
      137, 160, 216, 101, 52, 63, 167, 94, 29, 247, 100, 9, 6, 218, 165, 102, 171, 1, 147, 54, 252,
      194, 104, 184, 176, 181, 47, 128, 191, 35, 101, 142, 248, 78, 127, 51, 163, 185, 60, 116, 105,
      183, 199, 3,
    ],
  },
  {
    name: "Unloc Devnet Nft",
    symbol: "UNLOC",
    tribe: "Test 5",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK: [
      47, 189, 147, 2, 35, 185, 143, 206, 166, 235, 121, 127, 40, 93, 77, 119, 218, 145, 244, 150,
      137, 160, 216, 101, 52, 63, 167, 94, 29, 247, 100, 9, 6, 218, 165, 102, 171, 1, 147, 54, 252,
      194, 104, 184, 176, 181, 47, 128, 191, 35, 101, 142, 248, 78, 127, 51, 163, 185, 60, 116, 105,
      183, 199, 3,
    ],
  },
];

export const Airdrop = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loadingAirdrop, setLoadingAirdrop] = useState(false);

  async function airdropNft(
    connection: Connection,
    wallet: WalletContextState,
    index: number,
  ): Promise<[string, PublicKey]> {
    const metadata: SimpleMetadata = airdropMetadata[index];

    const transaction = new Transaction();
    const masterEditionMint = Keypair.generate();
    const [_masterEditionTokenAccountId] = await createMintTransaction(
      transaction,
      connection,
      wallet,
      wallet.publicKey!,
      masterEditionMint.publicKey,
    );
    const [masterEditionMetadataId] = await findNftMetadata(masterEditionMint.publicKey);
    const nftData = {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: 10,
      creators: [
        {
          address: wallet.publicKey!,
          verified: true,
          share: 100,
        },
      ],
      collection: {
        verified: false,
        key: masterEditionMint.publicKey,
      },
      uses: null,
    };
    const metadataIx = createCreateMetadataAccountV2Instruction(
      {
        metadata: masterEditionMetadataId,
        mint: masterEditionMint.publicKey,
        mintAuthority: wallet.publicKey!,
        payer: wallet.publicKey!,
        updateAuthority: wallet.publicKey!,
      },
      {
        createMetadataAccountArgsV2: {
          data: nftData,
          isMutable: true,
        },
      },
    );

    const [masterEditionId] = await findEditionPda(masterEditionMint.publicKey);
    const masterEditionIx = createCreateMasterEditionV3Instruction(
      {
        edition: masterEditionId,
        mint: masterEditionMint.publicKey,
        updateAuthority: wallet.publicKey!,
        mintAuthority: wallet.publicKey!,
        payer: wallet.publicKey!,
        metadata: masterEditionMetadataId,
      },
      {
        createMasterEditionArgs: {
          maxSupply: new BN(0),
        },
      },
    );
    const verifyCollectionIx = createVerifyCollectionInstruction({
      metadata: masterEditionMetadataId,
      collectionAuthority: wallet.publicKey!,
      payer: wallet.publicKey!,
      collectionMint: masterEditionMint.publicKey,
      collection: masterEditionMetadataId,
      collectionMasterEditionAccount: masterEditionId,
    });

    transaction.instructions = [
      ...transaction.instructions,
      metadataIx,
      masterEditionIx,
      verifyCollectionIx,
    ];
    transaction.feePayer = wallet.publicKey!;
    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();
    transaction.recentBlockhash = blockhash;

    await wallet.signTransaction!(transaction);

    transaction.partialSign(masterEditionMint);
    const txid = await wallet.sendTransaction(transaction, connection, {
      minContextSlot,
    });

    await connection.confirmTransaction(
      { blockhash, lastValidBlockHeight, signature: txid },
      "confirmed",
    );
    console.log(
      `Master edition (${masterEditionId.toString()}) created with metadata (${masterEditionMetadataId.toString()})`,
    );
    return [txid, masterEditionMint.publicKey];
  }

  const airdropNfts = async (
    connection: Connection,
    wallet: WalletContextState,
    count: number,
  ): Promise<[string, PublicKey][]> => {
    const txids: [string, PublicKey][] = [];
    for (let i = 0; i < count; i++) {
      try {
        const [txid, mintId] = await airdropNft(connection, wallet, i);
        notify({ message: `Mint successful ${i + 1}/${count}`, txid });
        txids.push([txid, mintId]);
      } catch (e) {
        console.log(e);
        notify({ message: `Mint failed ${i + 1}/${count}` });
      }
    }
    return txids;
  };

  return (
    <div>
      {config.devnet && connection && wallet && (
        <button
          className="btn btn--md btn--bordered"
          disabled={!wallet.connected}
          onClick={async () => {
            if (!wallet.connected) return;
            try {
              setLoadingAirdrop(true);
              await airdropNfts(connection, wallet, 1);
            } catch (e) {
              console.log(e);
              notify({ message: "Airdrop failed", type: "error" });
            } finally {
              setLoadingAirdrop(false);
            }
          }}>
          {loadingAirdrop ? "Running" : "Airdrop"}
        </button>
      )}
    </div>
  );
};
