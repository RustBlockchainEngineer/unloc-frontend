export const StakeActions = () => {
  return (
    <article className="stake__actions col">
      <div className="stake__plus">
        <span>New staking account</span>
        <div className="add-new">
          <button>
            <span className="button--circle">&#43;</span>
          </button>
        </div>
      </div>
      <div className="separator"></div>
      <div className="stake__buttons">
        <button className="btn btn--md btn--primary">Merge All</button>
        <button className="btn btn--md btn--bordered">Claim Rewards</button>
      </div>
    </article>
  );
};
