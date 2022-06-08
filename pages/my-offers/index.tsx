import { useEffect, useContext, useCallback } from "react";

import { PublicKey } from "@solana/web3.js";
import { observer } from "mobx-react";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { MyOffersNftList } from "@components/myOffers/myOffersNftList";
import { WalletActions } from "@components/myOffers/walletActions";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { StoreContext } from "@pages/_app";

const MyOffers: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { connected, walletKey } = store.Wallet;
  const { activeCategory } = store.MyOffers;

  const refreshSubOffers = useCallback(
    async (walletKeyProp: PublicKey) => {
      try {
        if (walletKeyProp) {
          await store.MyOffers.getOffersByWallet(walletKeyProp);
          await store.MyOffers.getNFTsData();
          await store.MyOffers.getSubOffersByOffers();
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    },
    [store.MyOffers],
  );

  useEffect(() => {
    if (connected && walletKey) void refreshSubOffers(walletKey);
  }, [connected, walletKey, refreshSubOffers]);

  return (
    <StoreDataAdapter>
      <LayoutTopMobile />
      <div className="page my-offers">
        <LayoutTop />
        <WalletActions />
        {connected && activeCategory === "active" && <MyOffersNftList type="active" />}
        {connected && activeCategory === "proposed" && <MyOffersNftList type="proposed" />}
        {connected && activeCategory === "deposited" && <MyOffersNftList type="deposited" />}
      </div>
    </StoreDataAdapter>
  );
});

export default MyOffers;
