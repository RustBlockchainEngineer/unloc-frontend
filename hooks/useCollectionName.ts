import axios from "axios";
import useSWR from "swr";

const fetcher = async (nftMint: string): Promise<string> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  (await axios.post("/api/collections/nft", { id: nftMint })).data as string;

export const useCollectionName = (
  mint: string,
): { collection: string; isLoading: boolean; isError: Error | undefined } => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useSWR<string, Error>(mint, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    collection: String(data),
    isLoading: error == null && !data,
    isError: error,
  };
};
