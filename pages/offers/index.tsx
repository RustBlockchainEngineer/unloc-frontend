import { observer } from "mobx-react-lite";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { StoreDataAdapter } from "@components/storeDataAdapter";

const MyOffers: NextPage = observer(() => {
  return (
    <StoreDataAdapter>
      <div className="page my-offers">
        <LayoutTop />
        <p>Not found</p>
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

// eslint-disable-next-line import/no-default-export
export default MyOffers;
