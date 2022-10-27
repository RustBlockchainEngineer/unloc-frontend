import { useUserScore } from "@hooks/useUserScore";

export const ProfileLevel = (): JSX.Element => {
  const { profile } = useUserScore();

  const level = profile.level;
  const feeReduction =
    profile.feeReductionBasisPoints === 0
      ? "No benefits yet"
      : (profile.feeReductionBasisPoints / 100).toString();

  return (
    <article className="profile__level col">
      <div className="profile__num">
        <span className="number">{level}</span>
        <span className="sub">Level</span>
      </div>
      <div className="profile__perks">
        <ul className="perks__list">
          <li className="perks__row">
            <p>Lending fee reduction</p>
            <p>{feeReduction}%</p>
          </li>
          <li className="perks__row">
            <p>Borrowing fee reduction</p>
            <p>{feeReduction}%</p>
          </li>
        </ul>
      </div>
    </article>
  );
};
