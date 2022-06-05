import { ProfileLevel, StakeActions, StakeBalance } from "./header";

export const ProfileHeader = () => {
  return (
    <section className="profile__header">
      <ProfileLevel />
      <StakeActions />
      <StakeBalance />
    </section>
  );
};
