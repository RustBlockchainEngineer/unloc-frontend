import { getDecimalsForLoanAmountAsString } from "@integration/getDecimalForLoanAmount";

import { currencyMints } from "@constants/currency";
import { calculateRepayValue } from "@utils/loansMath";
import { SubOfferData } from "@stores/Offers.store";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

export interface ITransformedOffer {
  subOfferKey: string;
  offerKey: string;
  nftData: Metadata;
  apr: string;
  amount: string;
  duration: string;
  currency: string;
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
  return pageOfferData.map(({ account, collection, nftData, pubkey }) => {
    const amount = getDecimalsForLoanAmountAsString(
      new BN(account.offerAmount).toNumber(),
      account.offerMint.toString(),
      0,
      2,
    ).toString();
    const apr = account.aprNumerator.toString();
    const duration = Math.floor(new BN(account.loanDuration).divn(3600 * 24).toNumber()).toString();
    return {
      subOfferKey: pubkey.toBase58(),
      offerKey: account.offer.toBase58(),
      nftData,
      amount,
      apr,
      duration,
      currency: currencyMints[account.offerMint.toBase58()],
      isYours: walletKey?.equals(account.borrower),
      collection,
      repayAmount: calculateRepayValue(Number(amount), Number(apr), Number(duration), denominator),
    };
  });
};
