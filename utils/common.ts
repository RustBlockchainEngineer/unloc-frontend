export const chunk = <T>(array: T[], chunkSize: number): T[][] =>
  array.reduce((accumulator, item, index) => {
    const chunkIndex = Math.floor(index / chunkSize);

    if (!accumulator[chunkIndex]) {
      accumulator[chunkIndex] = [];
    }

    accumulator[chunkIndex].push(item);

    return accumulator;
  }, [] as T[][]);

export function range(start = 0, end: number): number[] {
  return [...Array(end - start).keys()].map((i) => i + start);
}

export const zipMap = <T, U, V>(
  left: T[],
  right: U[],
  fn: (t: T, u: U | null, i: number) => V,
): V[] => left.map((t: T, index) => fn(t, right?.[index] ?? null, index));

// https://stackoverflow.com/questions/71273690/how-to-use-query-params-in-next-js
export function getQueryParamAsString(paramValue: string | string[] | undefined) {
  if (paramValue) {
    return typeof paramValue === "string" ? paramValue : paramValue[0];
  } else {
    return "";
  }
}