export const validateFilterInput = (value: string): boolean => {
  return value != undefined;
};

export const validateFilterRangeInput = (
  value: number,
  toCompare: number,
  rangeType: string,
): boolean => {
  if (isNaN(value)) {
    return false;
  }

  if (rangeType === "min") {
    return value >= 0 && value >= toCompare;
  } else {
    return value >= 0 && value <= toCompare;
  }
};
