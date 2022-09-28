// import { CircularProgressBar } from "@components/layout/circularProgressBar";
import dayjs from "dayjs";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface IDurationProgress {
  startUnix: number;
  endUnix: number;
}

export const DurationProgress = ({ startUnix, endUnix }: IDurationProgress) => {
  // const time = useSolanaUnixTime();
  const time = Math.floor(Date.now() / 1000);
  const maxValue = dayjs.duration((endUnix - startUnix) * 1000).asSeconds();
  const value = dayjs.duration((time - startUnix) * 1000).asSeconds();
  const remainingDays = Math.floor(dayjs.duration((endUnix - time) * 1000).asDays());

  const description = `Staked on ${dayjs(startUnix * 1000).toString()} \nUnlocks on: ${dayjs(
    endUnix * 1000,
  ).toString()}`;

  return (
    <CircularProgressbarWithChildren strokeWidth={14} value={value} maxValue={maxValue}>
      <div className="duration-text" style={{}} title={description}>
        <strong className="days">{remainingDays}</strong>
        <br />
        <span className="label">days</span>
      </div>
    </CircularProgressbarWithChildren>
  );
};
