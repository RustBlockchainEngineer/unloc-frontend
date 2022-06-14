import { useContext } from "react";

import { observer } from "mobx-react";
import Image from "next/image";
import { usePopperTooltip } from "react-popper-tooltip";
import { StoreContext } from "@pages/_app";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { ShowOnHover } from "@components/layout/showOnHover";
import { SolscanExplorerIcon } from "@components/layout/solscanExplorerIcon";
import { ClipboardButton } from "@components/layout/clipboardButton";
import { SanitizedOffer } from "../myOffersNftList";
import { errorCase, successCase } from "@methods/toast-error-handler";

interface MyOffersNftDepositedProps {
  sanitized: SanitizedOffer;
  classNames?: string;
}

export const MyOffersNftDeposited = observer(({ sanitized }: MyOffersNftDepositedProps) => {
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();
  const store = useContext(StoreContext);
  const { nftMint, offerKey, name, image, collection } = sanitized;

  const handleCancelCollateral = async () => {
    store.Lightbox.setContent("processing");
    store.Lightbox.setCanClose(false);
    store.Lightbox.setVisible(true);

    try {
      await store.MyOffers.handleCancelCollateral(nftMint);
      successCase(`NFT ${name} returned to the wallet`, name);
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(false);
    } catch (e: any) {
      errorCase(e);
    } finally {
      store.MyOffers.refetchStoreData();
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(false);
    }
  };

  return (
    <div className="nft-deposited-item">
      <div className="nft-deposited-item__row">
        {name && image ? (
          <>
            <Image src={image} alt="NFT Image" width="60px" height="60px" className="nft-img" />
            <p className="info-name">{name}</p>
          </>
        ) : (
          <p> Loading NFT Data </p>
        )}
      </div>
      <div className="nft-deposited-item__row">
        <div className="row--item">
          <p>Collateral ID</p>
          <ShowOnHover label={compressAddress(4, offerKey)} classNames="id">
            <ClipboardButton data={offerKey} />
            <SolscanExplorerIcon type={"token"} address={offerKey} />
          </ShowOnHover>
        </div>
        <div className="row--item">
          <p>NFT Mint</p>
          <ShowOnHover label={compressAddress(4, nftMint)} classNames="mint">
            <ClipboardButton data={nftMint} />
            <SolscanExplorerIcon type={"token"} address={nftMint} />
          </ShowOnHover>
        </div>
        <div className="row--item">
          <p>Collection</p>
          <div className="collection">{collection}</div>
        </div>
      </div>
      <div className="nft-deposited-item__row">
        <div className="buttons">
          <button className="btn btn--md btn--bordered" onClick={() => handleCancelCollateral()}>
            Cancel Collateral
          </button>
          <button
            ref={setTriggerRef}
            className="btn btn--md btn--primary"
            onClick={() => {
              store.MyOffers.setActiveNftMint(nftMint);
              store.MyOffers.setPreparedOfferImage({ name, image });
              store.Lightbox.setContent("loanCreate");
              store.Lightbox.setVisible(true);
            }}>
            Create Offer
          </button>
          {visible && (
            <div ref={setTooltipRef} {...getTooltipProps({ className: "tooltip-container" })}>
              Create a new Loan Offer using this NFT as Collateral
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
