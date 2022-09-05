import { Connection, PublicKey } from "@solana/web3.js";
import { Metadata, PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import axios from "axios";
import { GmaBuilder } from "./GmaBuilder";

export function findMetadataPda(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), PROGRAM_ID.toBuffer(), mint.toBuffer()],
    PROGRAM_ID,
  )[0];
}

export const fetchWhitelistedUserNfts = async (
  connection: Connection,
  wallet: PublicKey | null,
) => {
  if (!wallet) {
    throw Error("Connect your wallet");
  }
  const { value: tokenAccounts } = await connection.getParsedTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  const nftMints = tokenAccounts
    .filter((t) => {
      const amount = t.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
      const decimals = t.account?.data?.parsed?.info?.tokenAmount?.decimals;
      const state = t.account?.data?.parsed?.info?.state;
      return decimals === 0 && amount >= 1 && state !== "frozen";
    })
    .map((t) => {
      const mint = t.account?.data?.parsed?.info?.mint;
      return new PublicKey(mint);
    });

  const response = await axios.post("/api/nfts/whitelisted");

  if (!(response?.data?.length > 0)) {
    return [];
  }
  const whitelisted = nftMints.filter((nftMint) => response.data.includes(nftMint.toBase58()));
  const metadataPdas = whitelisted.map(findMetadataPda);

  const result = (
    await GmaBuilder.make(connection, metadataPdas, { commitment: "confirmed" }).getAndMap(
      (acc) => {
        if (!acc.exists) return null;
        return Metadata.deserialize(acc.data)[0];
      },
    )
  )
    .filter((item): item is Metadata => item !== null)
    .sort((a, b) => a.data.name.localeCompare(b.data.name));

  return result;
};
