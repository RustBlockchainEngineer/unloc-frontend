import React, { useContext } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { StoreContext } from "@pages/_app";
import { observer } from "mobx-react-lite";

export const VotingPage = observer(() => {
  const store = useContext(StoreContext);

  const [votingPower, setVotingPower] = React.useState(400);
  console.log("PIE", PieChart.defaultProps.radius);

  const nextVoteValues = { SMB: 20, DAA: 20, DeGods: 20, DT: 15, SolGods: 25 };

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

  const nextVoteData = voteData.map((vote) => {
    return { title: vote.title, value: nextVoteValues[vote.title], color: vote.color };
  });

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

  const setVote = () => {
    store.Lightbox.setContent("vote");
    store.Lightbox.setVisible(true);
  };

  store.Lightbox.setContent("vote");
  store.Lightbox.setVisible(true);

  return (
    <div className="voting-page">
      <div className="voting-page__power">
        VOTING POWER <span>{votingPower}</span> <i className="icon icon--info icon--vs1" />
      </div>
      <div className="voting-page__distribution">
        <div className="voting-page__distribution--wrapper">
          {renderColumn(voteData, "left")}
          <div className="separator"></div>
          {renderColumn(nextVoteData, "right")}
        </div>

        <div className="voting-page__distribution__button">
          <button className="btn btn--primary" onClick={setVote}>
            {" "}
            Vote{" "}
          </button>
        </div>
      </div>
    </div>
  );
});
