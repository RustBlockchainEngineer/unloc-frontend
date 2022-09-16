import { ReactNode } from "react";

import { Duration } from "dayjs/plugin/duration";
import { getTimeLeft } from "@utils/timeUtils/timeUtils";
import BN from "bn.js";

export const lendsTimeLeftHelpers = (timeLeft: Duration): ReactNode => {
  const [days, hours, minutes] = [
    Math.max(timeLeft.days(), 0),
    Math.max(timeLeft.hours(), 0),
    Math.max(timeLeft.minutes(), 0),
  ];

  const format = (...durations: [number, string][]) => {
    return durations.map(([len, name], i) => (
      <span key={i}>
        {len}
        <span>{name}</span>{" "}
      </span>
    ));
  };

  return format([days, "d"], [hours, "h"], [minutes, "m"]);
};

export const loanStatus = (color: string, isLends: boolean = false, status: string) => {
  if (status === "0" || status === "6") {
    return <p>Proposed</p>;
  }
  if (status === "1") {
    if (isLends) {
      const statusText = color === "red" ? "Defaulted" : "NFT Locked, Loan Offer Given";
      return <p>{statusText}</p>;
    } else {
      return <p>NFT Locked, Loan Offer Taken</p>;
    }
  }
  return;
};

export const correctTimeLeftDescription = (duration: BN, startTime: BN) => {
  const timeLeft = getTimeLeft(duration.toNumber(), startTime.toNumber());
  return timeLeft.days() > 0
    ? `${timeLeft.days()} Day${timeLeft.days() > 1 ? "s" : ""}`
    : timeLeft.hours() > 0
    ? `${timeLeft.hours()} Hour${timeLeft.hours() > 1 ? "s" : ""}`
    : timeLeft.minutes() > 0
    ? `${timeLeft.minutes()} Minute${timeLeft.minutes() > 1 ? "s" : ""}`
    : "Expired";
};
