import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import { PieChart } from "react-minimal-pie-chart";
import { usePopperTooltip } from "react-popper-tooltip";

import { CircleLoader } from "@components/layout/circleLoader";
import { useStore, useUserScore, useVotingSession } from "@hooks/index";
import { useCollectionsInfo } from "@hooks/useCollectionsInfo";
import { useUserVoteChoices } from "@hooks/useUserVoteChoices";
import { numVal } from "@utils/bignum";
import { compressAddress } from "@utils/stringUtils/compressAdress";

import { VotePieChart } from "./VotePieChart";

export const VotingPage = observer(() => {
  const { Lightbox, GlobalState } = useStore();
  const { score } = useUserScore();
  const { data } = useVotingSession();
  const { nameMap } = useCollectionsInfo();
  const { voteChoiceData } = useUserVoteChoices();
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const now = Math.floor(Date.now() / 1000);

  const isVotingActive = data
    ? now >= numVal(data.voting.startTimestamp) && now <= numVal(data.voting.endTimestamp)
    : false;

  // Check if the user has already voted in the ongoing election
  const hasVoted =
    voteChoiceData && data
      ? numVal(voteChoiceData.lastVotedAt) >= numVal(data.voting.startTimestamp) &&
        numVal(voteChoiceData.lastVotedAt) <= numVal(data.voting.endTimestamp)
      : false;

  // If voting is active, we need the sum of all votes
  const totalVotes =
    data && isVotingActive
      ? data?.projects.projects.reduce(
          (sum, voteInfo) => (sum += voteInfo.active ? numVal(voteInfo.votesCount) : 0),
          0,
        )
      : 0;

  if (!data)
    return (
      <div>
        <CircleLoader size="large" />
      </div>
    );

  const remainingTime = dayjs.duration(
    numVal(data.voting.endTimestamp) - GlobalState.currentTime,
    "s",
  );

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

  const voteData = [
    { title: "SMB", value: 55, color: colorList[0] },
    { title: "DAA", value: 20, color: colorList[1] },
    { title: "DeGods", value: 10, color: colorList[2] },
    { title: "DT", value: 10, color: colorList[3] },
    { title: "SolGods", value: 5, color: colorList[4] },
  ];

  // const nextVoteData = voteData.map((vote) => {
  //   return { title: vote.title, value: nextVoteValues[vote.title], color: vote.color };
  // });

  const setVote = () => {
    Lightbox.setVisible(false);
    Lightbox.setContent("vote");
    Lightbox.setVisible(true);
  };

  const handleViewChoices = () => {
    Lightbox.setVisible(false);
    Lightbox.setContent("voteChoices");
    Lightbox.setVisible(true);
  };

  const renderColumn = (
    voteInfo: Array<{ title: string; value: number; color: string }>,
    side: "left" | "right",
  ) => {
    return (
      <div className="vote-column">
        <div className="vote-column__header">
          {side === "left" ? "THIS WEEK’S DISTRIBUTION" : "NEXT WEEK’S DISTRIBUTION"}
        </div>
        <div className="vote-column__live">{side === "left" ? "" : "LIVE VOTE"}</div>
        <div className="vote-column__percent-column">
          {voteInfo.map(function (data, index) {
            return (
              <div className="row" key={data.title}>
                <span className="row__title">
                  <div
                    className={`row__title--dot color--${index + 1}`}
                    style={{ backgroundColor: data.color }}
                  />
                  {data.title}:
                </span>
                <span className="row__data">{data.value}%</span>
              </div>
            );
          })}
        </div>

        <div className="vote-column__chart">
          <PieChart data={[...voteInfo]} animate={true} lineWidth={25} />
        </div>
      </div>
    );
  };

  const renderActiveVote = (
    <div className="vote-column">
      <div className="vote-column__header">VOTE FOR CHANGES TO REWARD DISTRIBUTION</div>
      <div className="vote-column__live">LIVE VOTE - Ends in {formatDuration(remainingTime)}</div>
      <div className="vote-column__percent-column">
        {data?.projects.projects
          .filter((project) => project.active)
          .map((projectData, index) => (
            <div className="row" key={projectData.id}>
              <span className="row__title">
                <div
                  className={`row__title--dot color--${index + 1}`}
                  style={{ backgroundColor: voteData[projectData.id].color }}
                />
                {nameMap
                  ? nameMap[projectData?.collectionNft?.toBase58()]?.symbol
                  : compressAddress(4, projectData?.collectionNft?.toBase58())}
              </span>
              <span className="row__data">
                {((numVal(projectData.votesCount) / totalVotes) * 100).toFixed(2)}%
              </span>
            </div>
          ))}
      </div>

      <div className="vote-column__chart">
        <VotePieChart voteData={data} />
      </div>
    </div>
  );

  return (
    <div className="voting-page tw-mx-3 sm:tw-mx-auto">
      <div className="voting-page__power">
        VOTING POWER <span>{score.toString()}</span>
        <i ref={setTriggerRef} className="icon icon--info icon--vs1" />
        {visible && (
          <div
            className="tw-max-w-[25ch]"
            ref={setTooltipRef}
            {...getTooltipProps({ className: "tooltip-container" })}>
            Your voting power is based on your staking accounts! Create new staking accounts with
            longer lock durations to increase your voting power!
          </div>
        )}
      </div>
      <div className="voting-page__distribution">
        <div className="voting-page__distribution--wrapper">
          {renderColumn(voteData, "left")}
          <div className="separator"></div>
          {isVotingActive ? (
            renderActiveVote
          ) : (
            <div className="vote-column">
              <div className="vote-column__header">No active vote</div>
            </div>
          )}
        </div>
        <div className="voting-page__distribution__button">
          {hasVoted && (
            <div className="tw-text-center">
              You&apos;ve already voted in the last session! Click the button to view how you
              distributed your vote.
            </div>
          )}
          <button
            disabled={!isVotingActive}
            className={`btn ${isVotingActive ? "btn--primary" : "btn--disabled"} tw-py-4`}
            // onClick={hasVoted ? setVote}>
            onClick={() => (hasVoted ? handleViewChoices() : setVote())}>
            {hasVoted ? "Your voting choices" : "Vote"}
          </button>
        </div>
      </div>
    </div>
  );
});

const formatDuration = (dur: Duration) => {
  const days = dur.days();
  const hours = dur.hours().toString();
  const minutes = dur.minutes().toString().padStart(2, "0");
  const seconds = dur.seconds().toString().padStart(2, "0");
  const dayStr = days === 0 ? "" : days === 1 ? "1 day" : `${days} days`;
  const left = `${hours}:${minutes}:${seconds}`;

  return `${dayStr} and ${left}`;
};
