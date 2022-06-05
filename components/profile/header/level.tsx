export const ProfileLevel = () => {
  const levelBenefits: { description: string; value: number; unit: string }[] = [
    { description: "Lending fee reduction", value: 5, unit: "%" },
    { description: "Borrowing fee reduction", value: 5, unit: "%" },
  ];
  const level = 7;

  return (
    <article className="profile__level col">
      <div className="profile__num">
        <span className="number">{level}</span>
        <span className="sub">Level</span>
      </div>
      <div className="profile__perks">
        <ul className="perks__list">
          {levelBenefits.map(({ description, value, unit }) => (
            <li key={description} className="perks__row">
              <p>{description}</p>
              <p>
                {value}
                {unit}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};
