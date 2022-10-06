import { useContext, useEffect } from "react";

import { observer } from "mobx-react-lite";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { ProfileHeader, StakeRows } from "@components/profile";
import { SkeletonMyProfile } from "@components/skeleton/my-profile";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { StoreContext } from "@pages/_app";

const Profile: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { isLoading, switchLoading } = store.ProfileStore;
  useEffect(() => {
    //TODO: temporary solution for loading simulation
    setTimeout(() => switchLoading(false), 2000);

    return () => switchLoading(true);
  }, []);
  return (
    <StoreDataAdapter>
      <div className="page profile">
        <LayoutTop />
        <div className="profile__layout">
          {isLoading ? (
            <SkeletonMyProfile />
          ) : (
            <>
              <ProfileHeader />
              <StakeRows />
            </>
          )}
        </div>
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

export default Profile;
