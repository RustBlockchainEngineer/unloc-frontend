import { useContext } from "react";

import { observer } from "mobx-react";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { MyLendingList } from "@components/loans-given/myLendingList";
import { WalletActions } from "@components/myOffers/walletActions";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { StoreContext } from "@pages/_app";

const MyOffers: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { connected } = store.Wallet;

  return (
    <StoreDataAdapter>
      <div className="page my-offers">
        <LayoutTop />
        <WalletActions />
        {connected ? <MyLendingList /> : ""}
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

export default MyOffers;
