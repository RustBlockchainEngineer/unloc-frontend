export const validateFilterInput = (value: string): boolean => {
  return value != undefined;
};

export const validateFilterRangeInput = (
  value: number,
  toCompare: number,
  rangeType: string,
): boolean => {
  return value !== undefined && (rangeType === "min" ? value >= toCompare : value <= toCompare);
};
