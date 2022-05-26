import { useEffect, useContext, useState, useCallback } from "react";

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
  const [activeVisible, setActiveVisible] = useState(true);
  const [depositedVisible, setDepositedVisible] = useState(true);

  const store = useContext(StoreContext);
  const { connected, walletKey } = store.Wallet;
  const { activeHideable, depositedHideable } = store.MyOffers;

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

  const handleActiveVisibility = useCallback((): void => {
    if (!activeHideable) return;

    setActiveVisible(!activeVisible);
  }, [activeHideable, activeVisible]);

  const handleDepositedVisibility = useCallback((): void => {
    if (!depositedHideable) return;

    setDepositedVisible(!depositedVisible);
  }, [depositedHideable, depositedVisible]);

  useEffect(() => {
    if (connected && walletKey) void refreshSubOffers(walletKey);
  }, [connected, walletKey, refreshSubOffers]);

  return (
    <StoreDataAdapter>
      <div className="page my-offers">
        <LayoutTop />
        <WalletActions />
        {connected && (
          <div>
            <div className="active-offers--scrolldown">
              <button onClick={handleActiveVisibility}>
                Active Offers
                {activeHideable && (
                  <i
                    className={`icon icon--sm icon--filter--${activeVisible ? "striped" : "down"}`}
                  />
                )}
              </button>
              <MyOffersNftList type="active" listVisible={activeVisible} />
            </div>
            <div className="deposited--scrolldown">
              <button onClick={handleDepositedVisibility}>
                My Vault
                {depositedHideable && (
                  <i
                    className={`icon icon--sm icon--filter--${
                      depositedVisible ? "striped" : "down"
                    }`}
                  />
                )}
              </button>
              <MyOffersNftList type="deposited" listVisible={depositedVisible} />
            </div>
          </div>
        )}
      </div>
      <LayoutTopMobile />
    </StoreDataAdapter>
  );
});

export default MyOffers;
