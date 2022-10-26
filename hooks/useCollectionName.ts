import axios from "axios";
import useSWR from "swr";

const fetcher = async (nftMint: string): Promise<string> =>
  (await axios.post("/api/collections/nft", { id: nftMint })).data as string;

export const useCollectionName = (
  mint: string,
): { collection: string; isLoading: boolean; isError: Error | undefined } => {
  const { data, error } = useSWR<string, Error>(mint, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    collection: String(data),
    isLoading: !error && !data,
    isError: error,
  };
};
