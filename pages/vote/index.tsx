import { observer } from "mobx-react-lite";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { VotingView } from "@components/vote/votingView";

const Vote: NextPage = observer(() => {
  return (
    <StoreDataAdapter>
      <div className="page profile">
        <LayoutTop />
        <div className="profile__layout">
          <VotingView />
        </div>
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

// eslint-disable-next-line import/no-default-export
export default Vote;
