import { memo } from "react";

import { CircleLoader } from "@components/layout/circleLoader";

interface ICircleProcessingProps {
  classNames?: string;
}

export const CircleProcessing = memo(({ classNames }: ICircleProcessingProps) => {
  return (
    <div className={`circle-loader-lightbox ${classNames ? classNames : ""}`}>
      <CircleLoader size="large" />
      <div className={"circle-loader-lightbox__caption"}>Processing Transaction</div>
    </div>
  );
});
