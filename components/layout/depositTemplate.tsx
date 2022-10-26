import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { usePopperTooltip } from "react-popper-tooltip";

import { ClipboardButton } from "@components/layout/clipboardButton";
import { ShowOnHover } from "@components/layout/showOnHover";
import { OfferActionsHook } from "@hooks/offerActionsHook";
import { useCollectionName } from "@hooks/useCollectionName";
import { useOffChainMetadata } from "@hooks/useOffChainMetadata";
import { compressAddress } from "@utils/stringUtils/compressAdress";

interface DepositTemplateData {
  pubkey: PublicKey;
  metadata: Metadata;
}

export const DepositTemplate = observer(({ pubkey, metadata }: DepositTemplateData) => {
  const { setTriggerRef } = usePopperTooltip();
  const { createOffersHandler, handleCancelCollateral } = OfferActionsHook();
  const { json, isLoading, isError } = useOffChainMetadata(metadata.data.uri);
  const { collection, isLoading: isLoadingCollection } = useCollectionName(
    metadata.mint.toBase58(),
  );

  return (
    <div className="offer deposit">
      <div className="data-row head">
        {isLoading && <div>Loading</div>}
        {json && (
          <div className="info">
            <div className="image">
              {isLoading && <div>Loading</div>}
              {isError != null && <div>Error: {isError.message}</div>}
              {json && <Image src={json.image} alt="NFT Picture" width={55} height={55} />}
            </div>
            <div className="details">
              <p>{json.name}</p>
            </div>
          </div>
        )}
      </div>
      <div className="data-row offer-status">
        <div className="row-item">
          <p>Offer ID</p>
          <ShowOnHover label={compressAddress(4, pubkey)} classNames="on-hover">
            <ClipboardButton data={pubkey} />
          </ShowOnHover>
        </div>
        <div className="row-item">
          <p>NFT mint</p>
          <div className="on-hover">
            <ShowOnHover label={compressAddress(4, metadata.mint)}>
              <ClipboardButton data={metadata.mint} />
            </ShowOnHover>
          </div>
        </div>

        <div className="row-item">
          <p>Collection</p>
          <div>
            <p>{isLoadingCollection ? " " : collection}</p>
          </div>
        </div>
      </div>
      <div className="data-row actions">
        <button
          className="btn btn--md btn--bordered"
          onClick={async () => await handleCancelCollateral(metadata.mint, metadata.data.name)}>
          Cancel Collateral
        </button>
        <button
          ref={setTriggerRef}
          className="btn btn--md btn--primary"
          onClick={() =>
            createOffersHandler({
              metadata,
              offerKey: pubkey.toBase58(),
            })
          }>
          Create Offer
        </button>
      </div>
    </div>
  );
});
