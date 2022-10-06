import { Middleware, SWRHook } from "swr";

export const requestLogger: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    const extendedFetcher = (...args: any[]) => {
      if (!fetcher) throw Error("Must use fetcher");
      console.log("SWR Request:", key);
      return fetcher(...args);
    };

    return useSWRNext(key, extendedFetcher, config);
  };
};

export const serialize: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    if (!fetcher) throw Error("Must use fetcher");
    const serializedKey = Array.isArray(key) ? JSON.stringify(key) : key;
    return useSWRNext(serializedKey, (k) => fetcher(...JSON.parse(k)), config);
  };
};
