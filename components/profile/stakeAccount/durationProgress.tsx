import { CircularProgressBar } from "@components/layout/circularProgressBar";
// import dayjs from "dayjs";

interface IDurationProgress {
  startUnix: number;
  endUnix: number;
  label?: string;
}

export const DurationProgress = ({ startUnix, endUnix, label = "days" }: IDurationProgress) => {
  // const startDate = dayjs.unix(startUnix);
  // const endDate = dayjs.unix(endUnix);
  // const normalizedMax = endUnix - startUnix;
  // const normalizedStart = dayjs().unix() - startUnix;
  console.log(startUnix);
  console.log(endUnix);

  // Maybe move the markup that shows the dates around the circle here

  return <CircularProgressBar value={30} maxValue={90} label={label} />;
};
