import React from "react";
import { CircleChart } from "@components/layout/circleChart";
import { PieChart } from "react-minimal-pie-chart";

export const VotingPage = () => {
  const [votingPower, setVotingPower] = React.useState(400);
  console.log("PIE", PieChart.defaultProps.radius);

  const nextVoteValues = { SMB: 55, DAA: 20, DeGods: 10, DT: 10, SolGods: 5 };

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

  return (
    <div className="voting-page">
      <div className="voting-page__power">
        Voting Power {votingPower} <i className="icon info" />
      </div>
      <div className="voting-page__distribution">
        <div className="voting-page__distribution--wrapper">
          <div className="this-week">
            <div className="this-week__header">THIS WEEK’S DISTRIBUTION</div>

            <div className="this-week__percent-column">
              {voteData.map(function (data, index) {
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

            <div className="this-week__chart">
              <PieChart data={[...voteData]} animate={true} lineWidth={25} />
            </div>
          </div>
          <div className="next-week">
            <div className="this-week__header">THIS WEEK’S DISTRIBUTION</div>

            <div className="this-week__percent-column">
              {nextVoteData.map(function (data, index) {
                return (
                  <div className="row" key={data.title}>
                    <span className="row__title">
                      <div className={`row__title--dot color--${index + 1}`} />
                      {data.title}:
                    </span>
                    <span className="row__data">{data.value}%</span>
                  </div>
                );
              })}
            </div>

            <div className="this-week__chart">
              <PieChart data={[...nextVoteData]} animate={true} lineWidth={25} />
            </div>
          </div>
        </div>

        <div className="voting-page__distribution__button">
          <button className="btn btn--primary"> Vote </button>
        </div>
      </div>
    </div>
  );
};
