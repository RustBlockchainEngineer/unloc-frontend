import { CircularProgressBar } from "@components/layout/circularProgressBar";
import { useSolanaUnixTime } from "@hooks/useSolanaUnixTime";
import dayjs from "dayjs";
import { useEffect } from "react";
// import dayjs from "dayjs";

interface IDurationProgress {
  startUnix: number;
  endUnix: number;
  label?: string;
}

export const DurationProgress = ({ startUnix, endUnix, label = "days" }: IDurationProgress) => {
  const time = useSolanaUnixTime();
  const max = dayjs.duration((endUnix - startUnix) * 1000).asSeconds();
  const current = dayjs.duration((time - startUnix) * 1000).asSeconds();
  // const current = 5;
  useEffect(() => {
    console.log("current", current);

    console.log("max", max);
  }, []);
  // const startDate = dayjs.unix(startUnix);
  // const endDate = dayjs.unix(endUnix);
  // const normalizedMax = endUnix - startUnix;
  // const normalizedStart = dayjs().unix() - startUnix;
  // Maybe move the markup that shows the dates around the circle here

  return <CircularProgressBar value={30} maxValue={90} label={label} />;
};
