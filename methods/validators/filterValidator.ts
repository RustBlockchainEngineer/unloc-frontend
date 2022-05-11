export const validateFilterInput = (value: string, names: string): boolean => {
  return value != undefined;
};

export const validateFilterInputMin = (value: number, min: Number): boolean => {
  return value != undefined && value >= min;
};

export const validateFilterInputMax = (value: number, max: number): boolean => {
  return value != undefined && value <= max;
};
