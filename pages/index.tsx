import { useContext, useEffect } from "react";

import { observer } from "mobx-react";
import type { NextPage } from "next";
import Head from "next/head";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { OffersGrid } from "@components/offersPage/offersGrid";
import { OffersTable } from "@components/offersPage/offersTable";
import { OffersTop } from "@components/offersPage/offersTop";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { localesHome } from "@constants/locales";

import { StoreContext } from "./_app";

const Home: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { wallet, connected } = store.Wallet;
  const { viewType } = store.Offers;

  const handleOffers = async (): Promise<void> => {
    try {
      if (connected && wallet) {
        await store.Offers.refetchOffers();
        store.Offers.buildFilters(store.Offers.pageOfferData);
        store.Offers.buildFilterCollection();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  };

  useEffect(() => {
    if (wallet && connected) void handleOffers();
  }, [wallet, connected]);

  return (
    <StoreDataAdapter>
      <div className="page offers">
        <Head>
          <title>{localesHome.pageTitle}</title>
          <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
        </Head>
        <main>
          <LayoutTop />
          <OffersTop />
          {viewType === "grid" ? <OffersGrid /> : <OffersTable />}
        </main>
        <LayoutTopMobile />
      </div>
    </StoreDataAdapter>
  );
});

export default Home;
