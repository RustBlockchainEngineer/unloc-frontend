// These interfaces are based on the types that Anchor generates from the contract IDL.
// The IDL itself is available in ../integration/unloc_nft_loan.ts

import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export interface GlobalState {
  superOwner: PublicKey;
  treasuryWallet: PublicKey;
  accruedInterestNumerator: BN;
  aprNumerator: BN;
  denominator: BN;
  expireLoanDuration: BN;
}

export interface Offer {
  borrower: PublicKey;
  nftMint: PublicKey;
  collection: PublicKey;
  state: number;
  subOfferCount: BN;
  startSubOfferNum: BN;
  creationDate: BN;
}

export interface SubOffer {
  borrower: PublicKey;
  nftMint: PublicKey;
  offerMint: PublicKey;
  offerMintDecimals: number;
  state: number;
  offer: PublicKey;
  subOfferNumber: BN;
  lender: PublicKey;
  offerVault: PublicKey;
  offerAmount: BN;
  repaidAmount: BN;
  lenderClaimedAmount: BN;
  borrowerClaimedAmount: BN;
  loanStartedTime: BN;
  loanEndedTime: BN;
  loanDuration: BN;
  aprNumerator: BN;
  creationDate: BN;
  totalPoint: BN;
  collectionPoint: BN;
  rps: BN;
  rewardDebt: BN;
}

// Requests made using Anchor (fetchMultiple) can return data in this shape
export interface OfferAccount {
  publicKey: PublicKey;
  account: Offer;
  collection?: string;
}

export interface SubOfferAccount {
  publicKey: PublicKey;
  account: SubOffer;
}

export interface SanitizedData {
  name: string;
  image: string;
  collateralId: string;
  nftMint: string;
}

export interface PreparedOfferData {
  nftMint: string;
  amount: number;
  duration: number;
  APR: number;
  currency: string;
  repayValue: string;
}
