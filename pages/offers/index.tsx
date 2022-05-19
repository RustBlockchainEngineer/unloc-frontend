import { observer } from "mobx-react";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { Header } from "@components/singleOffer/Header/Header";
import { StoreDataAdapter } from "@components/storeDataAdapter";

const MyOffers: NextPage = observer(() => {
  return (
    <StoreDataAdapter>
      <div className="page my-offers">
        <LayoutTop />
        <Header
          collectionName="test"
          nftAddress="4G7tnw4nFy1zK8KW77HJyDn4tTU4vFcwQJF3FF9ek5Rj"
          nftImage="test"
          nftName="test"
          website="unloc.xyz"
        />
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

export default MyOffers;
