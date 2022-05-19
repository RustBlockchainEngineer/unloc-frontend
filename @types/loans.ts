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
  expireDurationForLender: BN;
}

export interface Offer {
  borrower: PublicKey;
  nftMint: PublicKey;
  nftVault: PublicKey;
  state: number;
  subOfferCount: BN;
  startSubOfferNum: BN;
}

export interface SubOffer {
  borrower: PublicKey;
  nftMint: PublicKey;
  offerMint: PublicKey;
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
  minRepaidNumerator: BN;
  aprNumerator: BN;
}