import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";

type TimeSplit = "milis" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";

/**
 * Function to multiply data.
 * @returns number
 */

function multi(a: number, b: number[]): number {
  let i = 1;
  b.map((time) => (i = i * time));
  return i * a;
}

/**
 * Function to divide data.
 * @returns number
 */

function division(a: number, b: number[]): number {
  let i = a;
  b.map((time) => (i = i / time));
  return i;
}

/**
 * Converts time. Way of transformation defines by specific function.
 * @param time time in seconds to be converted
 * @param duration which unit of time should be used for conversion
 * @param action defines which kind of time transformation we need
 * @returns duration time in seconds or specified unit
 */

const getDuration = (
  time: number,
  duration: TimeSplit,
  action: (a: number, b: number[]) => number,
): number => {
  switch (duration) {
    case "milis":
      return action.name === "division" ? multi(time, [1000]) : division(time, [1000]);

    case "seconds":
      return time;

    case "minutes":
      return action(time, [60]);

    case "hours":
      return action(time, [60, 60]);

    case "days":
      return action(time, [60, 60, 24]);

    case "weeks":
      return action(time, [60, 60, 24, 7]);

    case "months":
      return action(time, [60, 60, 24, 30]);

    case "years":
      return action(time, [60, 60, 24, 365]);
  }
};

/**
 * Converts time from seconds to any other unit
 * @param time time in seconds to be converted
 * @param duration which unit of time should be used for convertion
 * @returns getDuration
 */
export const getDurationFromContractData = (time: number, duration: TimeSplit): number => {
  return getDuration(time, duration, division);
};

/**
 * Converts time from any unit to seconds
 * @param time duration time for a loan
 * @param duration unit from which duration will be converted
 * @returns getDuration
 */
export const getDurationForContractData = (time: number, duration: TimeSplit): number => {
  return getDuration(time, duration, multi);
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

  if (seconds > GREEN_LOAN_BREAKPOINT) return "green";
  else if (seconds > ORANGE_LOAN_BREAKPOINT) return "yellow";
  else return "red";
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
  // eslint-disable-next-line import/no-named-as-default-member
  const endTime = dayjs.unix(startTime).add(duration, "seconds");
  const diffFromNow = endTime.diff(dayjs());

  return dayjs.duration(diffFromNow);
};
