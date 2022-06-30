import { useEffect, useContext } from "react";

import { observer } from "mobx-react";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { OffersWrap } from "@components/myOffers/offersWrap";
import { WalletActions } from "@components/myOffers/walletActions";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { OfferActionsHook } from "@hooks/offerActionsHook";
import { StoreContext } from "@pages/_app";

const MyOffers: NextPage = observer(() => {
  const store = useContext(StoreContext);
  const { connected, walletKey } = store.Wallet;
  const { activeCategory } = store.MyOffers;

  const { refreshSubOffers } = OfferActionsHook();

  useEffect(() => {
    if (connected && walletKey) void refreshSubOffers(walletKey);
  }, [connected, walletKey, refreshSubOffers]);

  return (
    <StoreDataAdapter>
      <LayoutTopMobile />
      <div className="page my-offers">
        <LayoutTop />
        <WalletActions />
        {connected && activeCategory && <OffersWrap />}
      </div>
    </StoreDataAdapter>
  );
});

export default MyOffers;
