import { useCallback, useContext, useEffect } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { FiltersRow } from "@components/offersPage/filtersRow";
import { OffersGrid } from "@components/offersPage/offersGrid";
import { OffersTable } from "@components/offersPage/offersTable";
import { StoreDataAdapter } from "@components/storeDataAdapter";

import { StoreContext } from "./_app";

const Home: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { viewType, buildFilters, refetchOffers } = store.Offers;
  const { publicKey: wallet } = useWallet();

  const handleOffers = useCallback(async () => {
    try {
      await refetchOffers();
      buildFilters();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }, [buildFilters, refetchOffers]);

  useEffect(() => {
    if (wallet) void handleOffers();
  }, [wallet, handleOffers, store.Wallet.connection]);

  return (
    <StoreDataAdapter>
      <LayoutTopMobile />
      <div className="page offers">
        <main>
          <LayoutTop />
          <FiltersRow />
          {viewType === "grid" ? <OffersGrid /> : <OffersTable />}
        </main>
      </div>
    </StoreDataAdapter>
  );
});

export default Home;
