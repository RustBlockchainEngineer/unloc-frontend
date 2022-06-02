import { observer } from "mobx-react";
import type { NextPage } from "next";

import { CircularProgressBar } from "@components/layout/circularProgressBar";
import { StoreDataAdapter } from "@components/storeDataAdapter";

const Test: NextPage = observer(() => {
  return (
    <StoreDataAdapter>
      <div className="page ">
        <CircularProgressBar value={20} maxValue={100} label="days" />
        <CircularProgressBar value={5} maxValue={100} label="days" />
        <CircularProgressBar value={5} maxValue={50} label="days" />
        <CircularProgressBar value={30} maxValue={30} label="days" />
        <CircularProgressBar value={60} maxValue={120} label="days" />
      </div>
    </StoreDataAdapter>
  );
});
export default Test;
