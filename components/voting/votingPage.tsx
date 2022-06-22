import React from "react";

export const VotingPage = () => {
  const [votingPower, setVotingPower] = React.useState(400);

  return (
    <div className="voting-page">
      <div className="voting-page__power">
        Voting Power {votingPower} <i className="icon info" />
      </div>
      <div className="voting-page__distribution">
        <div className="voting-page__distribution--wrapper">
          <div className="this-week"></div>
          <div className="next-week"></div>
        </div>

        <div className="voting-page__distribution__button">
          <button className="btn btn--primary"> Vote </button>
        </div>
      </div>
    </div>
  );
};
