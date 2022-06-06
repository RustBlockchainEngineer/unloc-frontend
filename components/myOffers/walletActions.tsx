import { useCallback, useContext, FC, MouseEvent } from "react";

import { observer } from "mobx-react";
import { usePopperTooltip } from "react-popper-tooltip";

import { ConnectWallet } from "@components/connectWallet/ConnectWallet";
import { StoreContext } from "@pages/_app";
import { OfferCategory } from "@stores/MyOffers.store";

const categories: { label: string; value: OfferCategory }[] = [
  { label: "Active Loans", value: "active" },
  { label: "Active Offers", value: "proposed" },
  { label: "My Vault", value: "deposited" },
];

export const WalletActions: FC = observer(() => {
  const store = useContext(StoreContext);
  const { connected } = store.Wallet;
  const { activeCategory } = store.MyOffers;
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const handleDeposit = useCallback(() => {
    store.Lightbox.setContent("collateral");
    store.Lightbox.setVisible(true);
  }, []);

  const handleCategoryClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    store.MyOffers.setActiveCategory(event.currentTarget.name as OfferCategory);
  }, []);

  return connected ? (
    <div className="my-offers-top">
      <div className="my-offers-top__heading">
        {categories.map((category) => (
          <button
            key={category.value}
            name={category.value}
            className={`btn btn--md ${
              activeCategory === category.value ? "btn--primary" : "btn--bordered"
            }`}
            onClick={handleCategoryClick}>
            {category.label}
          </button>
        ))}
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
      </div>
    </div>
  ) : (
    <div className="connect-wallet-modal-root">
      <ConnectWallet />
    </div>
  );
});
