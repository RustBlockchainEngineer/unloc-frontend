import axios from "axios";
import useSWR from "swr";

import { IArweaveMetadata } from "@utils/spl/types";

const fetcher = async (uri: string): Promise<IArweaveMetadata> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  (await axios.get(uri)).data as IArweaveMetadata;

export const useOffChainMetadata = (
  uri: string,
): { json: IArweaveMetadata; isLoading: boolean; isError: Error | undefined } => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useSWR<IArweaveMetadata, Error>(uri, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    json: data as IArweaveMetadata,
    isLoading: !error && !data,
    isError: error,
  };
};
