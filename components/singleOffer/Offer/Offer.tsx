import { memo } from "react";

import { usePopperTooltip } from "react-popper-tooltip";

import { ShowOnHover } from "@components/layout/showOnHover";
import { ClipboardButton } from "@components/layout/clipboardButton";
import { SolscanExplorerIcon } from "@components/layout/solscanExplorerIcon";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { currencyMints } from "@constants/currency";
import { statuses } from "@constants/offerStatuses";
import { ILightboxOffer } from "@stores/Lightbox.store";

type IProps = {
  offerID: string;
  offerMint: string;
  status: string;
  amount: string;
  token: string;
  duration: string;
  durationRemaning?: string;
  APR: number;
  totalRepay: string;
  btnMessage: string;
  handleConfirmOffer: (offer: ILightboxOffer) => void;
  offerPublicKey: string;
  isYours: boolean;
};

export const Offer = memo(
  ({
    offerID,
    offerMint,
    status,
    amount,
    token,
    duration,
    durationRemaning,
    APR,
    totalRepay,
    btnMessage,
    handleConfirmOffer,
    offerPublicKey,
    isYours,
  }: IProps) => {
    const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

    const currency = currencyMints[offerMint];

    return (
      <div className="offer-root">
        <div className="offer-container">
          <div className="offer-header">
            <div className="offer-ID">
              <p>Collateral ID</p>
              <ShowOnHover label={`${compressAddress(4, offerID)}`}>
                <ClipboardButton data={offerID} />
                <SolscanExplorerIcon type={"account"} address={offerID} />
              </ShowOnHover>
            </div>
            <div className="offer-status">
              <p>Status</p>
              <p>{statuses[status]}</p>
            </div>
          </div>
          <div className="offer-info">
            <div className="item-box">
              <p>Amount</p>
              <p>{`${amount} ${currency}`}</p>
            </div>
            <div className="item-box">
              <p>{statuses[status] == "Accepted" ? "Time left" : "Duration"}</p>
              <p>
                {duration} days {durationRemaning ? `${durationRemaning} days left` : ""}
              </p>
            </div>
            <div className="item-box">
              <p>APR</p>
              <p>{APR} %</p>
            </div>
            <div className="item-box">
              <p>Total repay amount</p>
              <p>
                {totalRepay} {token}
              </p>
            </div>
          </div>
        </div>
        <div className="offer-lend">
          <button
            ref={setTriggerRef}
            className={`lend-btn ${isYours ? "deactivated" : ""}`}
            onClick={() => {
              if (!isYours) {
                handleConfirmOffer({
                  offerPublicKey,
                  amount,
                  APR,
                  duration,
                  totalRepay,
                  currency,
                });
              }
            }}>
            {isYours ? "Can't lend" : btnMessage}
          </button>
          {visible && (
            <div ref={setTooltipRef} {...getTooltipProps({ className: "tooltip-container" })}>
              Give a Loan based on a NFT Collateral
            </div>
          )}
        </div>
      </div>
    );
  },
);
