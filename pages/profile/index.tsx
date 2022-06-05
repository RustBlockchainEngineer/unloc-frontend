import { observer } from "mobx-react";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { ProfileHeader, StakeRows } from "@components/profile";
import { StoreDataAdapter } from "@components/storeDataAdapter";

const MyOffers: NextPage = observer(() => {
  return (
    <StoreDataAdapter>
      <div className="page profile">
        <LayoutTop />
        <div className="profile__layout">
          <ProfileHeader />
          <StakeRows />
        </div>
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

export default MyOffers;
