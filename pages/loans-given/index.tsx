import { useContext } from "react";

import { observer } from "mobx-react";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { LoansList } from "@components/loans-given/loansList";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { StoreContext } from "@pages/_app";

const MyOffers: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { connected } = store.Wallet;

  return (
    <StoreDataAdapter>
      <LayoutTopMobile />
      <div className="page my-offers">
        <LayoutTop />
        {connected ? <LoansList /> : ""}
      </div>
    </StoreDataAdapter>
  );
});

export default MyOffers;
