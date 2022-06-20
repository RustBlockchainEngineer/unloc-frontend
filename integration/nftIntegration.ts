import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { IMetadata } from "../@types/nfts/nft";

import { RPC_ENDPOINT } from "@constants/config";

import { MultipleNFT, NFTMetadata } from "./nftLoan";

// Uncomment next line if using Solana cluster
// const cluster = clusterApiUrl(process.env.SOLANA_NET as Cluster
// const DEVNET_URL = 'https://api.devnet.solana.com'
const SOLANA_CONNECTION = new Connection(RPC_ENDPOINT, {
  disableRetryOnRateLimit: true,
});

export const getMetadata = async (mint: PublicKey): Promise<IMetadata> => {
  const metadataPDA = await Metadata.getPDA(mint);
  const { data: metadata } = await Metadata.load(SOLANA_CONNECTION, metadataPDA);

  const arweaveMetadata = (await axios.get(metadata.data.uri)).data;

  return {
    metadataPDA: metadataPDA.toString(),
    onChainMetadata: metadata,
    arweaveMetadata,
  };
};

export const getHistory = async (mint: PublicKey, options: Record<string, string | number>) => {
  return SOLANA_CONNECTION.getConfirmedSignaturesForAddress2(mint, options);
};

export const getWhitelistedNFTsByWallet = async (owner: PublicKey): Promise<NFTMetadata[]> => {
  const { value: tokens } = await SOLANA_CONNECTION.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  // Filter not freeze tokens
  const filteredTokens = tokens.filter((token) => {
    const {
      tokenAmount: { amount },
      state,
    } = token.account.data.parsed.info;

    return amount === "1" && state !== "frozen";
  });

  const response = await axios.post("/api/nfts/whitelisted");

  if (!(response && response.data && response.data.length > 0)) {
    return [];
  }

  const nfts = [];
  const nftMintKeys = filteredTokens.map(
    (token) => new PublicKey(token.account.data.parsed.info.mint),
  );

  if (!(nftMintKeys && nftMintKeys.length > 0)) {
    return [];
  }

  const filteredMints = nftMintKeys.filter((nftMint) => response.data.includes(nftMint.toBase58()));

  if (!(filteredMints && filteredMints.length > 0)) {
    return [];
  }

  const multipleNft = new MultipleNFT(filteredMints);
  await multipleNft.initialize();
  await multipleNft.initArweavedata();

  for (const token of filteredMints) {
    try {
      const nftMeta = multipleNft.getNftMeta(token);

      if (nftMeta) {
        nfts.push(nftMeta);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  return nfts;
};
