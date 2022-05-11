/**
 * Converts time from seconds to any other unit
 * @param time time in seconds to be converted
 * @param duration which unit of time should be used for convertion
 * @returns duration time in specified unit
 */
export const getDurationFromContractData = (
  time: number,
  duration: "milis" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years",
): number => {
  switch (duration) {
    case "milis":
      return time * 1000;

    case "seconds":
      return time;

    case "minutes":
      return time / 60;

    case "hours":
      return time / 60 / 60;

    case "days":
      return time / 60 / 60 / 24;

    case "weeks":
      return time / 60 / 60 / 24 / 7;

    case "months":
      return time / 60 / 60 / 24 / 30;

    case "years":
      return time / 60 / 60 / 24 / 365;
  }
};

/**
 * Converts time from any unit to seconds
 * @param time duration time for a loan
 * @param duration unit from which duration will be converted
 * @returns duration time in seconds
 */
export const getDurationForContractData = (
  time: number,
  duration: "milis" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years",
): number => {
  switch (duration) {
    case "milis":
      return time / 1000;

    case "seconds":
      return time;

    case "minutes":
      return time * 60;

    case "hours":
      return time * 60 * 60;

    case "days":
      return time * 60 * 60 * 24;

    case "weeks":
      return time * 60 * 60 * 24 * 7;

    case "months":
      return time * 60 * 60 * 24 * 30;

    case "years":
      return time * 60 * 60 * 24 * 365;
  }
};
