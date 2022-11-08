import { Metadata, PROGRAM_ID as TOKEN_META_PID } from "@metaplex-foundation/mpl-token-metadata";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createAcceptOfferInstruction,
  createClaimCollateralInstruction,
  createCreateOfferInstruction,
  createCreateSubOfferInstruction,
  createDeleteOfferInstruction,
  createDeleteSubOfferInstruction,
  createRepayLoanInstruction,
  createUpdateSubOfferInstruction,
  GlobalState,
  Offer,
  PROGRAM_ID,
  SubOffer,
} from "@unloc-dev/unloc-sdk-loan";
import BN from "bn.js";

import {
  addTokenAccountInstruction,
  getEditionKey,
  getNftMetadataKey,
  getWalletTokenAccount,
} from "./common";
import { BPF_LOADER_UPGRADEABLE_PROGRAM_ID, WSOL_MINT } from "./unloc-constants";
import {
  getCollectionLoanLiqMinEmissionsInfoKey,
  getCollectionLoanLiqMinEmissionsVaultKey,
  getLoanSubofferRewardsInfoKey,
  LIQ_MINING_PID,
} from "./unloc-liq-mining";
import { getStakingPoolKey, getUserScoreKey, STAKING_PID } from "./unloc-staking";

/// ////////////
// CONSTANTS //
/// ////////////
export const LOAN_PID: PublicKey = PROGRAM_ID;

export const GLOBAL_STATE_TAG = Buffer.from("GLOBAL_STATE_SEED");
export const REWARD_VAULT_TAG = Buffer.from("REWARD_VAULT_SEED");
export const OFFER_TAG = Buffer.from("OFFER_SEED");
export const SUB_OFFER_TAG = Buffer.from("SUB_OFFER_SEED");
export const NFT_VAULT_TAG = Buffer.from("NFT_VAULT_SEED");
export const OFFER_VAULT_TAG = Buffer.from("OFFER_VAULT_SEED");
export const TREASURY_VAULT_TAG = Buffer.from("TREASURY_VAULT_SEED");

export const META_PREFIX = Buffer.from("metadata");
export const EDITION_PREFIX = Buffer.from("edition");

export const SUB_OFFER_COUNT_PER_LEVEL = 5;
export const DEFULT_SUB_OFFER_COUNT = 3;
export const PRICE_DECIMALS_AMP = 100_000_000;
export const SHARE_PRECISION = 1000_000_000_000;
export const DIFF_SOL_USDC_DECIMALS = 1000;
export const UNIX_DAY = 86400;
export const DEFAULT_STAKE_DURATION = 5184000;

/// //////////////
// PDA helpers //
/// //////////////
export const getLoanProgramDataKey = (programId: PublicKey = LOAN_PID) => {
  return PublicKey.findProgramAddressSync(
    [programId.toBytes()],
    BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  )[0];
};
export const getLoanGlobalStateKey = (programId: PublicKey = LOAN_PID) => {
  return PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], programId)[0];
};
export const getOfferKey = (
  borrower: PublicKey,
  nftMint: PublicKey,
  programId: PublicKey = LOAN_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [OFFER_TAG, borrower.toBuffer(), nftMint.toBuffer()],
    programId,
  )[0];
};
export const getSubOfferKey = (
  offer: PublicKey,
  subOfferNumber: BN,
  programId: PublicKey = LOAN_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [SUB_OFFER_TAG, offer.toBuffer(), subOfferNumber.toArrayLike(Buffer, "be", 8)],
    programId,
  )[0];
};
export const getTreasuryVaultKey = (
  offerMint: PublicKey,
  treasuryWallet: PublicKey,
  programId: PublicKey = LOAN_PID,
) => {
  return PublicKey.findProgramAddressSync(
    [TREASURY_VAULT_TAG, offerMint.toBuffer(), treasuryWallet.toBuffer()],
    programId,
  )[0];
};
/// //////////////////////
// Instruction helpers //
/// //////////////////////
export const createLoanOffer = async (
  connection: Connection,
  borrower: PublicKey,
  nftMint: PublicKey,
  programId = LOAN_PID,
) => {
  const borrowerNftVault: PublicKey = await getWalletTokenAccount(connection, borrower, nftMint);
  const offer = getOfferKey(borrower, nftMint, programId);
  const nftMetadata = getNftMetadataKey(nftMint);
  const edition = getEditionKey(nftMint);
  const metadataProgram = TOKEN_META_PID;
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createCreateOfferInstruction(
      {
        borrower,
        payer: borrower,
        offer,
        nftMint,
        nftMetadata,
        userVault: borrowerNftVault,
        edition,
        metadataProgram,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
      programId,
    ),
  );

  return new Transaction().add(...instructions);
};

export const deleteLoanOffer = async (
  connection: Connection,
  borrower: PublicKey,
  nftMint: PublicKey,
  signers: Keypair[] = [],
  programId = LOAN_PID,
) => {
  const instructions: TransactionInstruction[] = [];
  let borrowerNftVault: PublicKey = await getWalletTokenAccount(connection, borrower, nftMint);
  if (!borrowerNftVault)
    borrowerNftVault = await addTokenAccountInstruction(
      connection,
      nftMint,
      borrower,
      instructions,
      borrower,
      signers,
    );

  const offer = getOfferKey(borrower, nftMint, programId);
  const edition = getEditionKey(nftMint);
  const metadataProgram = TOKEN_META_PID;

  instructions.push(
    createDeleteOfferInstruction(
      {
        borrower,
        offer,
        nftMint,
        userVault: borrowerNftVault,
        edition,
        metadataProgram,
      },
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};

export const createLoanSubOffer = async (
  connection: Connection,
  borrower: PublicKey,
  offerAmount: BN,
  loanDuration: BN,
  aprNumerator: BN,
  nftMint: PublicKey,
  offerMint: PublicKey,
  programId = LOAN_PID,
  stakingProgram = STAKING_PID,
) => {
  if (offerMint.equals(NATIVE_MINT)) offerMint = WSOL_MINT;

  const globalState = getLoanGlobalStateKey(programId);
  const offer = getOfferKey(borrower, nftMint, programId);
  const offerData = await Offer.fromAccountAddress(connection, offer);
  const subOfferNumber = offerData.subOfferCount;
  const subOffer = getSubOfferKey(offer, new BN(subOfferNumber), programId);
  const stakingPoolInfo = getStakingPoolKey(stakingProgram);
  const userScoreInfo = getUserScoreKey(borrower, stakingPoolInfo, stakingProgram);
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createCreateSubOfferInstruction(
      {
        borrower,
        payer: borrower,
        globalState,
        offer,
        subOffer,
        offerMint,
        stakingPoolInfo,
        userScoreInfo,
        stakingProgram,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
      {
        offerAmount,
        loanDuration,
        aprNumerator,
      },
      programId,
    ),
  );

  return new Transaction().add(...instructions);
};

export const updateLoanSubOffer = async (
  connection: Connection,
  borrower: PublicKey,
  offerAmount: BN,
  loanDuration: BN,
  aprNumerator: BN,
  subOffer: PublicKey,
  programId = LOAN_PID,
) => {
  const subOfferData = await SubOffer.fromAccountAddress(connection, subOffer);
  const offerMint: PublicKey = subOfferData.offerMint;
  const offer = subOfferData.offer;
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createUpdateSubOfferInstruction(
      {
        borrower,
        offer,
        subOffer,
        offerMint,
      },
      {
        offerAmount,
        loanDuration,
        aprNumerator,
      },
      programId,
    ),
  );

  return new Transaction().add(...instructions);
};

export const deleteLoanSubOffer = async (
  connection: Connection,
  borrower: PublicKey,
  subOffer: PublicKey,
  programId = LOAN_PID,
) => {
  const subOfferData = await SubOffer.fromAccountAddress(connection, subOffer);
  const offer = subOfferData.offer;
  const instructions: TransactionInstruction[] = [];
  instructions.push(
    createDeleteSubOfferInstruction(
      {
        borrower,
        offer,
        subOffer,
      },
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};

export const acceptLoanOffer = async (
  connection: Connection,
  lender: PublicKey,
  subOffer: PublicKey,
  signers: Keypair[] = [],
  programId = LOAN_PID,
  liqMinProgram = LIQ_MINING_PID,
) => {
  const instructions: TransactionInstruction[] = [];
  const subOfferData = await SubOffer.fromAccountAddress(connection, subOffer);
  const offer = subOfferData.offer;
  const offerMint = subOfferData.offerMint;
  const offerData = await Offer.fromAccountAddress(connection, subOfferData.offer);
  const borrower = offerData.borrower;

  const globalState = getLoanGlobalStateKey(programId);
  const globalStateData = await GlobalState.fromAccountAddress(connection, globalState);

  let borrowerOfferVault = await getWalletTokenAccount(connection, borrower, offerMint);
  let lenderOfferVault = await getWalletTokenAccount(connection, lender, offerMint);
  if (offerMint.equals(WSOL_MINT)) {
    const treasuryVault = getTreasuryVaultKey(offerMint, globalStateData.treasuryWallet, programId);
    lenderOfferVault = treasuryVault;
    borrowerOfferVault = treasuryVault;
  } else {
    if (!borrowerOfferVault) {
      console.log("borrower doesn't have offer token account!");
      borrowerOfferVault = await addTokenAccountInstruction(
        connection,
        offerMint,
        borrower,
        instructions,
        lender,
        signers,
      );
    }
    if (!lenderOfferVault) {
      console.log("lender doesn't have offer token!");
      return null;
    }
  }

  const nftMetadata = getNftMetadataKey(subOfferData.nftMint);
  const metadata = await Metadata.fromAccountAddress(connection, nftMetadata);
  const collectionNft = metadata.collection!.key;
  const collectionLoanLiqMinEmissionsInfo = getCollectionLoanLiqMinEmissionsInfoKey(
    collectionNft,
    liqMinProgram,
  );
  const collectionLoanLiqMinEmissionsVault = getCollectionLoanLiqMinEmissionsVaultKey(
    collectionNft,
    liqMinProgram,
  );
  const activeSubofferLoanRewardsInfo = getLoanSubofferRewardsInfoKey(subOffer, liqMinProgram);
  instructions.push(
    createAcceptOfferInstruction(
      {
        lender,
        borrower,
        globalState,
        offer,
        subOffer,
        offerMint,
        borrowerOfferVault,
        lenderOfferVault,
        clock: SYSVAR_CLOCK_PUBKEY,

        collectionLoanLiqMinEmissionsInfo,
        activeSubofferLoanRewardsInfo,
        collectionLoanLiqMinEmissionsVault,
        collectionNft,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
        loanProgram: programId,
        liqMinProgram,
      },
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};

export const repayLoan = async (
  connection: Connection,
  borrower: PublicKey,
  subOffer: PublicKey,
  signers: Keypair[] = [],
  programId = LOAN_PID,
  stakingProgram = STAKING_PID,
  liqMinProgram = LIQ_MINING_PID,
) => {
  const instructions: TransactionInstruction[] = [];
  const globalState = getLoanGlobalStateKey(programId);
  const globalStateData = await GlobalState.fromAccountAddress(connection, globalState);
  const treasuryWallet = globalStateData.treasuryWallet;
  const subOfferData = await SubOffer.fromAccountAddress(connection, subOffer);
  const offer = subOfferData.offer;
  const lender = subOfferData.lender;
  const offerData = await Offer.fromAccountAddress(connection, offer);
  const offerMint = subOfferData.offerMint;
  const nftMint = offerData.nftMint;
  const treasuryVault = getTreasuryVaultKey(offerMint, globalStateData.treasuryWallet, programId);

  let borrowerOfferVault = await getWalletTokenAccount(connection, borrower, offerMint);
  let borrowerNftVault = await getWalletTokenAccount(connection, borrower, nftMint);
  let lenderOfferVault = await getWalletTokenAccount(connection, lender, offerMint);
  if (offerMint.equals(WSOL_MINT)) {
    lenderOfferVault = treasuryVault;
    borrowerOfferVault = treasuryVault;
  }

  if (!borrowerOfferVault) {
    console.log("borrower doesn't have offer token!");
    return;
  }
  if (!borrowerNftVault) {
    console.log("borrower doesn't have nft token token account!");
    borrowerNftVault = await addTokenAccountInstruction(
      connection,
      nftMint,
      borrower,
      instructions,
      borrower,
      signers,
    );
  }
  if (!lenderOfferVault) {
    console.log("lender doesn't have offer token account!", lender.toBase58());
    lenderOfferVault = await addTokenAccountInstruction(
      connection,
      offerMint,
      lender,
      instructions,
      borrower,
      signers,
    );
  }
  const edition = getEditionKey(nftMint);
  const stakingPoolInfo = getStakingPoolKey(stakingProgram);
  const borrowerUserScoreInfo = getUserScoreKey(borrower, stakingPoolInfo, stakingProgram);
  const lenderUserScoreInfo = getUserScoreKey(lender, stakingPoolInfo, stakingProgram);
  const metadataProgram = TOKEN_META_PID;

  const nftMetadata = getNftMetadataKey(subOfferData.nftMint);
  const metadata = await Metadata.fromAccountAddress(connection, nftMetadata);
  const collectionNft = metadata.collection!.key;
  const collectionLoanLiqMinEmissionsInfo = getCollectionLoanLiqMinEmissionsInfoKey(
    collectionNft,
    liqMinProgram,
  );
  const collectionLoanLiqMinEmissionsVault = getCollectionLoanLiqMinEmissionsVaultKey(
    collectionNft,
    liqMinProgram,
  );
  const activeSubofferLoanRewardsInfo = getLoanSubofferRewardsInfoKey(subOffer, liqMinProgram);
  instructions.push(
    createRepayLoanInstruction(
      {
        borrower,
        payer: borrower,
        lender,
        globalState,
        treasuryWallet,
        offer,
        subOffer,
        nftMint,
        borrowerNftVault,
        lenderOfferVault,
        borrowerOfferVault,
        offerMint,
        treasuryVault,
        stakingPoolInfo,
        borrowerUserScoreInfo,
        lenderUserScoreInfo,
        stakingProgram,
        edition,
        metadataProgram,
        clock: SYSVAR_CLOCK_PUBKEY,

        collectionLoanLiqMinEmissionsInfo,
        activeSubofferLoanRewardsInfo,
        collectionLoanLiqMinEmissionsVault,
        collectionNft,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
        loanProgram: programId,
        liqMinProgram,
      },
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};

export const claimLoanCollateral = async (
  connection: Connection,
  lender: PublicKey,
  subOffer: PublicKey,
  signers: Keypair[] = [],
  programId = LOAN_PID,
  stakingProgram = STAKING_PID,
  liqMinProgram = LIQ_MINING_PID,
) => {
  const instructions: TransactionInstruction[] = [];
  const globalState = getLoanGlobalStateKey(programId);
  const globalStateData = await GlobalState.fromAccountAddress(connection, globalState);
  const treasuryWallet = globalStateData.treasuryWallet;
  const subOfferData = await SubOffer.fromAccountAddress(connection, subOffer);
  const offer = subOfferData.offer;
  const offerData = await Offer.fromAccountAddress(connection, offer);
  const offerMint = subOfferData.offerMint;
  const nftMint = offerData.nftMint;
  const treasuryVault = getTreasuryVaultKey(offerMint, treasuryWallet, programId);

  const borrowerNftVault = await getWalletTokenAccount(connection, offerData.borrower, nftMint);
  let lenderNftVault = await getWalletTokenAccount(connection, lender, nftMint);
  let lenderOfferVault = await getWalletTokenAccount(connection, lender, offerMint);
  const preInstructions: TransactionInstruction[] = [];
  if (offerMint.equals(WSOL_MINT)) lenderOfferVault = treasuryVault;

  if (!lenderNftVault) {
    console.log("lender doesn't have nft token token account!");
    lenderNftVault = await addTokenAccountInstruction(
      connection,
      nftMint,
      lender,
      preInstructions,
      lender,
      signers,
    );
  }
  if (!lenderOfferVault) {
    console.log("lender doesn't have offer token account!", lender.toBase58());
    lenderOfferVault = await addTokenAccountInstruction(
      connection,
      offerMint,
      lender,
      preInstructions,
      lender,
      signers,
    );
  }
  const edition = getEditionKey(nftMint);
  const stakingPoolInfo = getStakingPoolKey(stakingProgram);
  const lenderUserScoreInfo = getUserScoreKey(lender, stakingPoolInfo, stakingProgram);
  const metadataProgram = TOKEN_META_PID;

  const nftMetadata = getNftMetadataKey(subOfferData.nftMint);
  const metadata = await Metadata.fromAccountAddress(connection, nftMetadata);
  const collectionNft = metadata.collection!.key;
  const collectionLoanLiqMinEmissionsInfo = getCollectionLoanLiqMinEmissionsInfoKey(
    collectionNft,
    liqMinProgram,
  );
  const collectionLoanLiqMinEmissionsVault = getCollectionLoanLiqMinEmissionsVaultKey(
    collectionNft,
    liqMinProgram,
  );
  const activeSubofferLoanRewardsInfo = getLoanSubofferRewardsInfoKey(subOffer, liqMinProgram);
  instructions.push(
    createClaimCollateralInstruction(
      {
        lender,
        payer: lender,
        globalState,
        treasuryWallet,
        offer,
        subOffer,
        nftMint,
        lenderNftVault,
        borrowerNftVault,
        lenderOfferVault,
        offerMint,
        treasuryVault,
        edition,
        stakingPoolInfo,
        lenderUserScoreInfo,
        stakingProgram,
        metadataProgram,
        clock: SYSVAR_CLOCK_PUBKEY,

        collectionLoanLiqMinEmissionsInfo,
        activeSubofferLoanRewardsInfo,
        collectionLoanLiqMinEmissionsVault,
        collectionNft,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
        loanProgram: programId,
        liqMinProgram,
      },
      programId,
    ),
  );
  return new Transaction().add(...instructions);
};
