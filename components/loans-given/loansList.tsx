import { ReactNode, useContext, useEffect, useState } from "react";

import { observer } from "mobx-react";

import { StoreContext } from "@pages/_app";
import { currencyMints } from "@constants/currency";
import { ShowOnHover } from "@components/layout/showOnHover";
import { ClipboardButton } from "@components/layout/clipboardButton";
import { SolscanExplorerIcon } from "@components/layout/solscanExplorerIcon";
import { PublicKey } from "@solana/web3.js";
import Image from "next/image";
import { compressAddress } from "@utils/stringUtils/compressAdress";
import { getDecimalsForLoanAmountAsString } from "@integration/getDecimalForLoanAmount";
import { BlobLoader } from "@components/layout/blobLoader";
import { Duration } from "dayjs/plugin/duration";
import { getDurationColor, getTimeLeft } from "@utils/timeUtils/timeUtils";
import { errorCase, successCase } from "@methods/toast-error-handler";

export const LoansList = observer(() => {
  const store = useContext(StoreContext);
  const { lendingList } = store.MyOffers;
  const [isFetchingUserLended, setIsFetchingUserLended] = useState(true);
  const canClaim = (timeLeft: Duration) => {
    return timeLeft.asSeconds() <= 0;
  };

  useEffect(() => {
    const fetchUserLended = async () => {
      if (store.Wallet.connected && store.Wallet.wallet) {
        setIsFetchingUserLended(true);
        await store.MyOffers.fetchUserLendedOffers();
        setIsFetchingUserLended(false);
      }
    };
    fetchUserLended();
  }, [store.Wallet.connected, store.Wallet.wallet]);

  const loanStatus = (timeLeft: Duration) => {
    const color = getDurationColor(timeLeft);
    const statusText = color === "red" ? "Defaulted" : "Loan Offer Given";

    return <p className={`loan-containers__status ${color}`}>{statusText}</p>;
  };

  const formatTimeLeft = (timeLeft: Duration): ReactNode => {
    const [days, hours, minutes] = [
      Math.max(timeLeft.days(), 0),
      Math.max(timeLeft.hours(), 0),
      Math.max(timeLeft.minutes(), 0),
    ];

    const format = (...durations: [number, string][]) => {
      return durations.map(([len, name], i) => (
        <span key={i}>
          {len}
          <span className="loan-time--left__sub">{name}</span>{" "}
        </span>
      ));
    };

    return format([days, "d"], [hours, "h"], [minutes, "m"]);
  };

  const handleClaimCollateral = async (offerKey: PublicKey) => {
    store.Lightbox.setContent("circleProcessing");
    store.Lightbox.setCanClose(false);
    store.Lightbox.setVisible(true);

    try {
      await store.MyOffers.handleClaimCollateral(offerKey);
      successCase("NFT Claimed");
    } catch (e: any) {
      errorCase(e);
    } finally {
      store.MyOffers.refetchStoreData();
      store.Lightbox.setCanClose(true);
      store.Lightbox.setVisible(false);
    }
  };

  const renderLoansGiven = () => {
    return lendingList.map((offer) => {
      if (!offer?.nftData) {
        return <></>;
      }
      const duration = getTimeLeft(offer.loanDuration.toNumber(), offer.loanStartedTime.toNumber());
      const timeClassName = getDurationColor(duration);

      return (
        <div key={offer.subOfferKey.toString()} className={`loan-given ${timeClassName}`}>
          <div className="loan__row">
            <div className={`loan__row--item header`}>
              <Image
                src={offer.nftData.arweaveMetadata.image}
                className="item__image"
                alt="NFT Picture"
                width={52}
                height={52}
              />
              <div className={`item__title`}>
                <p className="name"> {offer.nftData.arweaveMetadata.name}</p>
                <p className="collection">
                  Collection: <span>{offer.collection}</span>
                </p>
              </div>
            </div>

            <div className={`loan__row--item loan-time ${timeClassName}`}>
              <span> Time left </span>
              <div className="time-row">{formatTimeLeft(duration)}</div>
            </div>
          </div>

          <div className="loan__row">
            <div className="loan__row--item">
              <h4>Borrower ID</h4>
              <ShowOnHover
                label={compressAddress(4, offer.borrower.toBase58())}
                classNames="loan-containers__id">
                <ClipboardButton data={offer.borrower.toString()} />
                <SolscanExplorerIcon type={"token"} address={offer.borrower.toString()} />
              </ShowOnHover>
            </div>
            <div className={`loan__row--item ${timeClassName} status`}>
              <h4>Status</h4>
              {loanStatus(duration)}
            </div>
            <div className="loan__row--item">
              <h4>NFT Mint</h4>
              <ShowOnHover
                label={compressAddress(4, offer.nftMint.toString())}
                classNames="loan-containers__mint">
                <ClipboardButton data={offer.nftMint.toString()} />
                <SolscanExplorerIcon type={"token"} address={offer.nftMint.toString()} />
              </ShowOnHover>
            </div>
          </div>

          <div className="loan__row details">
            <div className="loan__row--item">
              <h4>Amount</h4>
              <p>{`${getDecimalsForLoanAmountAsString(
                offer.offerAmount.toNumber(),
                offer.offerMint.toBase58(),
                0,
              )} ${currencyMints[offer.offerMint.toBase58()]}`}</p>
            </div>

            <div className="loan__row--item">
              <h4>APR</h4>
              <p>{offer.aprNumerator.toString()}%</p>
            </div>

            {/* <div className='loan__row--item'>
              <h4>Min repaid value</h4>
              <p>{offer.minRepaidNumerator.toString()}</p>
            </div> */}
          </div>

          {canClaim(duration) ? (
            <div className="loan__row">
              <button
                className="btn btn--md btn--primary claim-nft--button"
                onClick={() => handleClaimCollateral(offer.subOfferKey)}>
                Claim NFT
              </button>
            </div>
          ) : (
            <div className="loan__row">
              <button className="btn btn--md btn--primary disabled loan-not-repaid-button">
                Loan not Repaid yet
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  if (isFetchingUserLended) {
    return (
      <div className="my-lending-nft-list-loading">
        <BlobLoader />
      </div>
    );
  }

  return lendingList?.length ? (
    <div className="my-lending-nft-list">
      <h1>Loans given</h1>
      <div className="my-lending-nft-list__inner">{renderLoansGiven()}</div>
    </div>
  ) : (
    <div className="my-lending-nft-list empty">
      <h1>No loans given yet</h1>
    </div>
  );
});
