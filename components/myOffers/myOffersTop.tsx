import { useCallback, useContext, FC } from "react";

import { observer } from "mobx-react";
import { usePopperTooltip } from "react-popper-tooltip";

import { ConnectWallet } from "@components/connectWallet/ConnectWallet";
import { ClipboardButton } from "@components/layout/clipboardButton";
import { ShowOnHover } from "@components/layout/showOnHover";
import { SolscanExplorerIcon } from "@components/layout/solscanExplorerIcon";
import { StoreContext } from "@pages/_app";
import { compressAddress } from "@utils/stringUtils/compressAdress";

export const MyOffersTop: FC = observer(() => {
  const store = useContext(StoreContext);
  const { wallet, walletKey, connected } = store.Wallet;

  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const handleWalletDisconnect = (): void => {
    // TODO: adapter prop is missing on wallet.
    if (wallet /*&& wallet.adapter*/) {
      store.Wallet.handleDisconnect();
    }
  };

  const handleDeposit = useCallback(() => {
    store.Lightbox.setContent("collateral");
    store.Lightbox.setVisible(true);
  }, []);

  return connected ? (
    <div className="my-offers-top">
      <div className="my-offers-top__heading">
        {walletKey ? (
          <>
            <span className="wallet-label">Your wallet address:</span>
            <h2>
              <ShowOnHover label={`${compressAddress(4, walletKey.toBase58())}`}>
                <ClipboardButton data={walletKey.toBase58()} />
                <SolscanExplorerIcon type="account" address={walletKey.toBase58()} />
              </ShowOnHover>
            </h2>
          </>
        ) : (
          ""
        )}
      </div>
      <div className="my-offers-top__toolbox">
        <button ref={setTriggerRef} className="btn btn--md btn--primary" onClick={handleDeposit}>
          Deposit NFT
        </button>
        {visible && (
          <div ref={setTooltipRef} {...getTooltipProps({ className: "tooltip-container" })}>
            Create a new Collateral from a NFT
          </div>
        )}
        {wallet /*&& wallet.adapter*/ ? (
          <button className="btn btn--md btn--bordered" onClick={() => handleWalletDisconnect()}>
            Disconnect
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  ) : (
    <div className="connect-wallet-modal-root">
      <ConnectWallet />
    </div>
  );
});
