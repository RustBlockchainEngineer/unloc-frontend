export const StakeBalance = () => {
  const totalLocked = "3685.00";
  const totalClaimable = "1200.00";
  const count = 3;

  return (
    <article className="stake__balance col">
      <div className="top">UNLOC STAKED</div>
      <div className="stake__amounts">
        <div className="amount__locked">
          <span>{totalLocked}</span>
        </div>
        <div className="separator"></div>
        <div className="amount__claim">
          <div>{totalClaimable}</div>
          <div className="sub">Available to claim!</div>
        </div>
      </div>
      <p>{count} staking accounts</p>
    </article>
  );
};
