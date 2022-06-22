import { getDecimalsForLoanAmountAsString } from "@integration/getDecimalForLoanAmount";

import { currencyMints } from "@constants/currency";
import { calculateRepayValue } from "@utils/loansMath";
import { SubOfferData } from "@stores/Offers.store";
import { PublicKey } from "@solana/web3.js";

export interface ITransformedOffer {
  subOfferKey: string;
  offerKey: string;
  nftMint: string;
  image: string;
  name: string;
  apr: number;
  amount: string;
  duration: string;
  currency: string;
  count: number;
  isYours?: boolean;
  collection: string;
  repayAmount: string;
}

/**
 * This is used to transform the offer data in a shape more appropriate for the offers table view
 *
 * @param {SubOfferData[]} pageOfferData
 * @param {number} denominator
 * @param {PublicKey|undefined} walletKey Optional to indicate offers that are created by the user
 * @returns {ITransformedOffer[]}
 */
export const transformOffersData = (
  pageOfferData: SubOfferData[],
  denominator: number,
  walletKey?: PublicKey,
): ITransformedOffer[] => {
  // In pageOfferData, nftData and collection properties are lazy loaded,
  // so it's possible they're not initialized.We need to filter for those,
  // unfortunately this confuses typescript so we need a helper function.
  // TODO: if the collection field is not loaded, we could handle that
  // silently maybe? The nftData is more important.

  return pageOfferData.filter(isNftDataLoaded).map((offerData) => {
    const amount = getDecimalsForLoanAmountAsString(
      offerData.offerAmount.toNumber(),
      offerData.offerMint.toString(),
      0,
      2,
    ).toString();
    const apr = offerData.aprNumerator.toNumber();
    const duration = Math.floor(offerData.loanDuration.toNumber() / (3600 * 24)).toString();
    return {
      subOfferKey: offerData.subOfferKey.toString(),
      offerKey: offerData.offer.toString(),
      nftMint: offerData.nftData.mint.toString(),
      image: offerData.nftData.arweaveMetadata.image,
      name: offerData.nftData.arweaveMetadata.name,
      amount,
      apr,
      duration,
      currency: currencyMints[offerData.offerMint.toBase58()],
      count: 0,
      isYours: walletKey?.equals(offerData.borrower),
      collection: offerData.collection,
      repayAmount: calculateRepayValue(Number(amount), apr, Number(duration), denominator),
    };
  });
};

// Oof
const isNftDataLoaded = (offer: SubOfferData): offer is Required<SubOfferData> => {
  return !!offer.nftData && !!offer.collection;
};
