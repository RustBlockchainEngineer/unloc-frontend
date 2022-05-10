import {useContext, useMemo} from "react";
import {StoreContext} from "@pages/_app";
import {getDecimalsForLoanAmountAsString} from "@integration/getDecimalForLoanAmount";
import {asBigNumber} from "@utils/asBigNumber";
import {currencyMints} from "@constants/currency";
import {calculateRepayValue} from "@utils/calculateRepayValue";

export interface ICollectedOffersData {
  subOfferKey: string
  image: string
  name: string
  apr: number
  amount: string
  duration: number
  currency: string
  count: number
  isYours: boolean
  collection: string
}

export const CollectedOffersData = () => {
  const store = useContext(StoreContext)
  const { denominator } = store.GlobalState;
  const { walletKey } = store.Wallet
  const { pageOfferData } = store.Offers;

  return pageOfferData.map(offerData => {
    const amount = getDecimalsForLoanAmountAsString(offerData.offerAmount.toNumber(), offerData.offerMint.toString(), 0, 2).toString();
    const apr = asBigNumber(offerData.aprNumerator);
    const duration = Math.floor(offerData.loanDuration.toNumber() / (3600 * 24));
    return {
      subOfferKey: offerData.subOfferKey.toString(),
      image: offerData.nftData.arweaveMetadata.image,
      name: offerData.nftData.arweaveMetadata.name,
      amount,
      apr,
      duration,
      currency: currencyMints[offerData.offerMint.toBase58()],
      count: offerData.count,
      isYours: offerData.borrower.equals(walletKey),
      collection: offerData.collection,
      repayAmount: calculateRepayValue(Number(amount), apr, duration, denominator)
    }
  })
};