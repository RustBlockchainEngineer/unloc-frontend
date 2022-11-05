import { observer } from "mobx-react-lite";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { VotingPage } from "@components/voting/votingPage";

export const Voting: NextPage = observer(() => {
  return (
    <StoreDataAdapter>
      <div className="page voting">
        <LayoutTop />
        <VotingPage />
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

// eslint-disable-next-line import/no-default-export
export default Voting;
