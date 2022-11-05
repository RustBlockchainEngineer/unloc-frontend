import { useMemo } from "react";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { ProjectData } from "@unloc-dev/unloc-sdk-voting";
import useSWRImmutable from "swr/immutable";

import { zipMap } from "@utils/common";
import { GmaBuilder } from "@utils/spl/GmaBuilder";
import { getNftMetadataKey } from "@utils/spl/unloc-voting";

import { useVotingSession } from "./useVotingSession";

const COLLECTIONS_INFO_KEY = "GET_COLLECTIONS_INFO";

const mapCollectionNftsToNames = (connection: Connection, projects: ProjectData[]) => async () => {
  const collectionNfts = projects.map(({ collectionNft }) => collectionNft);
  const keyList = collectionNfts.map((address) => getNftMetadataKey(address));

  const projectMetadata = await GmaBuilder.make(connection, keyList).getAndMap((acc) => {
    if (acc.exists) return { ...Metadata.deserialize(acc.data)[0] };
    else return null;
  });

  const collectionToName = zipMap(collectionNfts, projectMetadata, (c, nft) => {
    if (!nft) return null;
    else return { publicKey: c.toBase58(), name: nft.data.name, symbol: nft.data.symbol };
  }).filter((item): item is { publicKey: string; name: string; symbol: string } => item !== null);

  type CollectionToName = Record<string, { name: string; symbol: string }>;
  const mapped = collectionToName.reduce<CollectionToName>((map, obj) => {
    map[obj.publicKey] = { name: obj.name, symbol: obj.symbol };
    return map;
  }, {});

  return mapped;
};

export const useCollectionsInfo = () => {
  const { connection } = useConnection();
  const { data: votingData } = useVotingSession();
  const fetcher = useMemo(
    () => mapCollectionNftsToNames(connection, votingData ? votingData.projects.projects : []),
    [connection, votingData],
  );

  const { data, error } = useSWRImmutable(
    () => (votingData ? COLLECTIONS_INFO_KEY : null),
    fetcher,
  );

  return {
    nameMap: data,
    error,
  };
};
