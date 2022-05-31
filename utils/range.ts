export function range(start = 0, end: number): number[] {
  return [...Array(end - start).keys()].map((i) => i + start);
}
