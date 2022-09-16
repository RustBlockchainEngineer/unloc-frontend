import { useEffect } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { observer } from "mobx-react";
import type { NextPage } from "next";

import { LayoutTop } from "@components/layout/layoutTop";
import { LayoutTopMobile } from "@components/layout/layoutTopMobile";
import { OffersWrap } from "@components/myOffers/offersWrap";
import { WalletActions } from "@components/myOffers/walletActions";
import { StoreDataAdapter } from "@components/storeDataAdapter";
import { OfferActionsHook } from "@hooks/offerActionsHook";

const MyOffers: NextPage = observer(() => {
  const { publicKey } = useWallet();
  const { refreshSubOffers } = OfferActionsHook();

  useEffect(() => {
    if (publicKey) void refreshSubOffers(publicKey);
  }, [publicKey, refreshSubOffers]);

  return (
    <StoreDataAdapter>
      <LayoutTopMobile />
      <div className="page my-offers">
        <LayoutTop />
        <WalletActions />
        <OffersWrap />
      </div>
    </StoreDataAdapter>
  );
});

export default MyOffers;
