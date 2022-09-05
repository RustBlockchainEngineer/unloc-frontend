import { useCallback, useContext, MouseEvent, useState, Fragment } from "react";

import { observer } from "mobx-react";
import { usePopperTooltip } from "react-popper-tooltip";

import { ConnectWallet } from "@components/connectWallet/ConnectWallet";
import { StoreContext } from "@pages/_app";
import { OfferCategory } from "@stores/MyOffers.store";
import { CustomSelect } from "@components/layout/customSelect";
import { useWallet } from "@solana/wallet-adapter-react";

const categories: { label: string; value: OfferCategory; options?: string[] }[] = [
  { label: "Active Loans", value: "active", options: ["All", "Borrows", "Lends"] },
  { label: "Active Offers", value: "proposed" },
  { label: "My Vault", value: "deposited" },
];

export const WalletActions = observer(() => {
  const store = useContext(StoreContext);
  const { publicKey: wallet } = useWallet();
  const { activeCategory } = store.MyOffers;
  const [sortOption, setSortOption] = useState("All");
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

  const handleDeposit = useCallback(() => {
    store.Lightbox.setContent("collateral");
    store.Lightbox.setVisible(true);
  }, []);

  const handleCategoryClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    store.MyOffers.setActiveCategory(event.currentTarget.name as OfferCategory);
  }, []);

  const sortNFT = (option: string) => {
    setSortOption(option);
    store.MyOffers.setActiveLoan(option.toLowerCase());
  };

  return wallet ? (
    <div className="my-offers-top">
      <div className="my-offers-top__heading">
        {categories.map((category) => (
          <Fragment key={category.value}>
            <button
              key={category.value}
              name={category.value}
              className={`btn btn--md ${
                activeCategory === category.value ? "btn--primary" : "btn--bordered"
              }`}
              onClick={handleCategoryClick}>
              {category.label}
            </button>
            {category.options && activeCategory === "active" && (
              <CustomSelect
                key={`${category.value}-select`}
                options={category.options}
                selectedOption={sortOption}
                setSelectedOption={sortNFT}
                classNames={"sort-select"}
              />
            )}
          </Fragment>
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
