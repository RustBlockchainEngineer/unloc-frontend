import React, { useContext } from "react";
import type { NextPage } from "next";
import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { MyOffersTop } from "@components/myOffers/myOffersTop";
import { MyLendingList } from "@components/myOffers/myLendingList";

const MyOffers: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { connected } = store.Wallet;

  return (
    <StoreDataAdapter>
      <div className="page my-offers">
        <LayoutTop />
        <MyOffersTop />
        {connected ? <MyLendingList /> : ""}
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

export default MyOffers;
