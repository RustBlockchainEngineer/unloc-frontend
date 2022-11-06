import { VoteSessionInfo } from "@unloc-dev/unloc-sdk-voting";
import { PieChart } from "react-minimal-pie-chart";
import type { Data } from "react-minimal-pie-chart/types/commonTypes";

import { CircleLoader } from "@components/layout/circleLoader";
import { useCollectionsInfo } from "@hooks/useCollectionsInfo";
import { numVal } from "@utils/spl/common";

const colorList = [
  "#d63abe",
  "#0262d2",
  "#02d2d2",
  "#1fd202",
  "#d2ca02",
  "#9c02d2",
  "#d2025a",
  "#d20202",
  "#d27f02",
  "#b5d202",
  "#02d26e",
  "#c202d2",
  "#258f00",
  "#930069",
  "#005593",
  "#00a711",
  "#930000",
  "#00936f",
  "#000f93",
  "#a24e00",
];

export const VotePieChart = ({ voteData }: { voteData: VoteSessionInfo }) => {
  const { nameMap } = useCollectionsInfo();

  if (!nameMap)
    return (
      <div>
        <CircleLoader size="large" />
      </div>
    );

  const totalVotes = voteData.projects.projects.reduce(
    (sum, projectData) => (projectData.active ? (sum += numVal(projectData.votesCount)) : sum),
    0,
  );

  const pieData: Data = voteData.projects.projects
    .filter((projectData) => projectData.active)
    .map((projectData, idx) => ({
      name: nameMap[projectData.collectionNft.toBase58()].symbol,
      title: nameMap[projectData.collectionNft.toBase58()].name,
      value: (numVal(projectData.votesCount) / totalVotes) * 100,
      color: colorList[idx],
    }));

  return <PieChart totalValue={100} data={pieData} lineWidth={25} animate={true} />;
};
