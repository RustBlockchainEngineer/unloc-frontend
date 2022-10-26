import { ProfileLevel, StakeActions, StakeBalance } from "./header";

export const ProfileHeader = (): JSX.Element => {
  return (
    <section className="profile__header">
      <ProfileLevel />
      <StakeActions />
      <StakeBalance />
    </section>
  );
};
