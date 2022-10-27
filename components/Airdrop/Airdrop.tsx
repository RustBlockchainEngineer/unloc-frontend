import { useState, FC } from "react";

import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV2Instruction,
  createVerifyCollectionInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { useConnection, useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import BN from "bn.js";

import { config } from "@constants/config";

import { notify } from "./Notification";
import { createMintTransaction, findEditionPda, findNftMetadata } from "./utils";

interface SimpleMetadata {
  name: string;
  symbol: string;
  tribe: string;
  uri: string;
  collection: string;
  collectionPK: number[];
}
const collectionPK = [
  47, 189, 147, 2, 35, 185, 143, 206, 166, 235, 121, 127, 40, 93, 77, 119, 218, 145, 244, 150, 137,
  160, 216, 101, 52, 63, 167, 94, 29, 247, 100, 9, 6, 218, 165, 102, 171, 1, 147, 54, 252, 194, 104,
  184, 176, 181, 47, 128, 191, 35, 101, 142, 248, 78, 127, 51, 163, 185, 60, 116, 105, 183, 199, 3,
];
const airdropMetadata: SimpleMetadata[] = [
  {
    name: "Solana Donkey Business #22",
    symbol: "SDB",
    tribe: "Solana Donkey Business",
    uri: "https://s3.eu-central-1.amazonaws.com/cdn.unloc.xyz/unloc_devnet/json/7yQGqnCk7hHb4YDuiirr2dVhJ6TP1BbFGRei6353WXZU.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK,
  },
  {
    name: "Solana Donkey Business 3 #18",
    symbol: "SDN",
    tribe: "Solana Donkey Business",
    uri: "https://cdn-unloc-devnet.s3.eu-central-1.amazonaws.com/29Mkr5AY69pRtAfEqgjWHxQ85tWWiPgiHaX6YLF3iL73.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK,
  },
  {
    name: "Solana Donkey Business 3 #29",
    symbol: "SDB",
    tribe: "Solana Donkey Business",
    uri: "https://cdn-unloc-devnet.s3.eu-central-1.amazonaws.com/2sNX7ridj3ywYX77MvEAWbpHhkM6XhQCrTedJXqKAM9c.png",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK,
  },
  {
    name: "Solana Donkey Business 3 #9",
    symbol: "SDB",
    tribe: "Solana Donkey Business",
    uri: "https://cdn-unloc-devnet.s3.eu-central-1.amazonaws.com/2wPc3MK2CEJjZB9uveyL1acLHZLAcoww7wiaS6L6iDBH.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK,
  },
  {
    name: "Solana Donkey Business 3 #7",
    symbol: "SDB",
    tribe: "Solana Donkey Business",
    uri: "https://cdn-unloc-devnet.s3.eu-central-1.amazonaws.com/47UrobeLdcvgu2iUmnBK5XL1tcy8dc7yA4pRsqLYbVit.json",
    collection: "TkpSRsB8yB2qRETXLuPxuZ6Fkg2vuJnmfsQiJLfVpmG",
    collectionPK,
  },
];

export const Airdrop: FC = () => {
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
  ): Promise<Array<[string, PublicKey]>> => {
    const txids: Array<[string, PublicKey]> = [];
    for (let i = 0; i < count; i++)
      try {
        const [txid, mintId] = await airdropNft(connection, wallet, i);
        notify({ message: `Mint successful ${i + 1}/${count}`, txid });
        txids.push([txid, mintId]);
      } catch (e) {
        console.log(e);
        notify({ message: `Mint failed ${i + 1}/${count}` });
      }

    return txids;
  };

  const requestAirdrop = async (): Promise<void> => {
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
  };

  return (
    <div>
      {config.devnet && connection && wallet && (
        <button
          className="btn btn--md btn--bordered"
          disabled={!wallet.connected}
          onClick={requestAirdrop}>
          {loadingAirdrop ? "Running" : "Airdrop"}
        </button>
      )}
    </div>
  );
};
