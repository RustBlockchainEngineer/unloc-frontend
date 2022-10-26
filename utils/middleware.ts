import { Middleware, SWRHook } from "swr";

export const requestLogger: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const extendedFetcher = (...args: any[]) => {
      if (fetcher == null) throw Error("Must use fetcher");
      console.log("SWR Request:", key);
      return fetcher(...args);
    };

    return useSWRNext(key, extendedFetcher, config);
  };
};

export const serialize: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    if (fetcher == null) throw Error("Must use fetcher");
    const serializedKey = Array.isArray(key) ? JSON.stringify(key) : key;
    return useSWRNext(serializedKey, (k) => fetcher(...JSON.parse(k)), config);
  };
};
