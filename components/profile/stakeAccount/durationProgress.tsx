import { CircularProgressBar } from "@components/layout/circularProgressBar";
import dayjs from "dayjs";

interface IDurationProgress {
  startUnix: number;
  endUnix: number;
  label?: string;
}

export const DurationProgress = ({ startUnix, endUnix, label = "days" }: IDurationProgress) => {
  const startDate = dayjs.unix(startUnix);
  const endDate = dayjs.unix(endUnix);
  const normalizedMax = endUnix - startUnix;
  const normalizedStart = dayjs().unix() - startUnix;

  return <CircularProgressBar value={30} maxValue={90} label={label} />;
};
