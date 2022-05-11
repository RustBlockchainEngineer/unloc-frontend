import { useContext, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { observer } from "mobx-react";
import { StoreContext } from "@pages/_app";
import { localesHome } from "@constants/locales";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { OffersTop } from "@components/offersPage/offersTop";
import { OffersGrid } from "@components/offersPage/offersGrid";
import { OffersTable } from "@components/offersPage/offersTable";
import Footer from "@components/layout/footer";

const Home: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { wallet, connected } = store.Wallet;
  const { viewType } = store.Offers;

  const handleOffers = async () => {
    try {
      if (connected && wallet) {
        await store.Offers.refetchOffers();
        store.Offers.buildFilters(store.Offers.pageOfferData);
        store.Offers.buildFilterCollection();
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (wallet && connected) {
      handleOffers();
    }
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
