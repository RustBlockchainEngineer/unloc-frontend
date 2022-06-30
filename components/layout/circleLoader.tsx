import { memo } from "react";

interface ICircleLoaderProps {
  classNames?: string;
  size: "small" | "medium" | "large";
}

export const CircleLoader = memo(({ classNames, size }: ICircleLoaderProps) => {
  return <div className={`circle-loader ${classNames ? classNames : ""} ${size}`}></div>;
});
