import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";

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

export const GREEN_LOAN_BREAKPOINT = 129_600;
export const ORANGE_LOAN_BREAKPOINT = 0;
export type DurationColorStatus = "green" | "yellow" | "red";

/**
 * Converts a duration to a "humanized" status color. There are 3 colors: green, orange and red.
 * If the time duration is greater than 1.5 days (129_600 seconds) -> green.
 * If the time is greater than 0, but less than 1.5 days -> orange.
 * Otherwise (less than 0) -> red.
 * @param {Duration} duration     duration
 * @returns {DurationColorStatus} status color
 */
export const getDurationColor = (duration: Duration): DurationColorStatus => {
  const seconds = duration.asSeconds();

  if (seconds > GREEN_LOAN_BREAKPOINT) {
    return "green";
  } else if (seconds > ORANGE_LOAN_BREAKPOINT) {
    return "yellow";
  } else {
    return "red";
  }
};

/**
 * Converts a duration and a start time of loan to a Duration object,
 * representing the time until the loan expires.
 *
 * @param {number} duration  loan duration in seconds
 * @param {number} startTime unix timestamp of the loan start time
 * @returns {Duration}       remaining duration
 */
export const getTimeLeft = (duration: number, startTime: number): Duration => {
  const endTime = dayjs.unix(startTime).add(duration, "seconds");
  const diffFromNow = endTime.diff(dayjs());

  return dayjs.duration(diffFromNow);
};
