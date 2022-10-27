import axios from "axios";
import useSWR from "swr";

import { IArweaveMetadata } from "@utils/spl/types";

const fetcher = async (uri: string): Promise<IArweaveMetadata> =>
  (await axios.get(uri)).data as IArweaveMetadata;

export const useOffChainMetadata = (
  uri: string,
): { json: IArweaveMetadata; isLoading: boolean; isError: Error | undefined } => {
  const { data, error } = useSWR<IArweaveMetadata, Error>(uri, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    json: data as IArweaveMetadata,
    isLoading: error == null && data == null,
    isError: error,
  };
};
