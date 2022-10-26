/// //////////////////////
// Transaction helpers //
/// //////////////////////

import {
  getAssociatedTokenAddressSync,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAcceptOfferInstruction,
  createCancelOfferInstruction,
  createCancelSubOfferInstruction,
  createClaimCollateralInstruction,
  createRepayLoanInstruction,
  createSetOfferInstruction,
  createSetSubOfferInstruction,
  GlobalState,
  Offer,
  SubOffer,
} from "@unloc-dev/unloc-loan-solita";
import BN from "bn.js";

import {
  CHAINLINK_PROGRAMS,
  DEFAULT_PROGRAMS,
  GLOBAL_STATE_TAG,
  METADATA,
  NFT_LOAN_PID,
  OFFER_TAG,
  SUB_OFFER_TAG,
  TREASURY_VAULT_TAG,
} from "@constants/config";
import { currencies, currencyMints } from "@constants/currency";
import { getDurationForContractData } from "@utils/timeUtils/timeUtils";

// Borrower actions
export const createOffer = (wallet: PublicKey, nftMint: PublicKey): Transaction => {
  const userVault = getAssociatedTokenAddressSync(nftMint, wallet);
  const nftMetadata = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA.toBuffer(), nftMint.toBuffer()],
    METADATA,
  )[0];
  const edition = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA.toBuffer(), nftMint.toBuffer(), Buffer.from("edition")],
    METADATA,
  )[0];
  const offer = PublicKey.findProgramAddressSync(
    [OFFER_TAG, wallet.toBuffer(), nftMint.toBuffer()],
    NFT_LOAN_PID,
  )[0];

  const ix = createSetOfferInstruction(
    {
      borrower: wallet,
      nftMint,
      payer: wallet,
      nftMetadata,
      edition,
      userVault,
      offer,
      ...DEFAULT_PROGRAMS,
    },
    NFT_LOAN_PID,
  );

  return new Transaction().add(ix);
};

export const cancelOffer = (wallet: PublicKey, nftMint: PublicKey): Transaction => {
  const [offer] = PublicKey.findProgramAddressSync(
    [OFFER_TAG, wallet.toBuffer(), nftMint.toBuffer()],
    NFT_LOAN_PID,
  );
  const userVault = getAssociatedTokenAddressSync(nftMint, wallet);

  const [edition] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA.toBuffer(), nftMint.toBuffer(), Buffer.from("edition")],
    METADATA,
  );

  const ix = createCancelOfferInstruction(
    {
      borrower: wallet,
      nftMint,
      offer,
      userVault,
      edition,
      ...DEFAULT_PROGRAMS,
    },
    NFT_LOAN_PID,
  );

  return new Transaction().add(ix);
};

export const createSubOffer = async (
  connection: Connection,
  wallet: PublicKey,
  nftMint: PublicKey,
  currency: string,
  aprNumerator: number,
  durationInDays: number,
  uiAmount: number,
): Promise<Transaction> => {
  const [globalState] = PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], NFT_LOAN_PID);
  const globalStateInfo = await GlobalState.fromAccountAddress(connection, globalState);
  const [offer] = PublicKey.findProgramAddressSync(
    [OFFER_TAG, wallet.toBuffer(), nftMint.toBuffer()],
    NFT_LOAN_PID,
  );
  const offerInfo = await Offer.fromAccountAddress(connection, offer);
  const subOfferCount = new BN(offerInfo.subOfferCount);
  const [subOffer] = PublicKey.findProgramAddressSync(
    [SUB_OFFER_TAG, offer.toBuffer(), subOfferCount.toArrayLike(Buffer, "be", 8)],
    NFT_LOAN_PID,
  );
  const offerMint = new PublicKey(currencies[currency].mint);
  const [treasuryVault] = PublicKey.findProgramAddressSync(
    [TREASURY_VAULT_TAG, offerMint.toBuffer(), globalStateInfo.treasuryWallet.toBuffer()],
    NFT_LOAN_PID,
  );
  const decimals = currencies[currency].decimals;
  const offerAmount = new BN(uiAmount).mul(new BN(10).pow(new BN(decimals)));

  const ix = createSetSubOfferInstruction(
    {
      borrower: wallet,
      payer: wallet,
      globalState,
      offerMint,
      offer,
      subOffer,
      treasuryVault,
      treasuryWallet: globalStateInfo.treasuryWallet,
      ...DEFAULT_PROGRAMS,
    },
    {
      offerAmount,
      aprNumerator,
      loanDuration: getDurationForContractData(durationInDays, "days"),
      subOfferNumber: subOfferCount,
    },
    NFT_LOAN_PID,
  );

  return new Transaction().add(ix);
};

export const updateSubOffer = async (
  connection: Connection,
  wallet: PublicKey,
  subOffer: PublicKey,
  aprNumerator: number,
  duration: number,
  amount: number,
): Promise<Transaction> => {
  const [globalState] = PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], NFT_LOAN_PID);
  const globalStateInfo = await GlobalState.fromAccountAddress(connection, globalState);
  const subOfferInfo = await SubOffer.fromAccountAddress(connection, subOffer);

  const offer = subOfferInfo.offer;
  const subOfferNumber = subOfferInfo.subOfferNumber;
  const offerMint = subOfferInfo.offerMint;
  const [treasuryVault] = PublicKey.findProgramAddressSync(
    [TREASURY_VAULT_TAG, offerMint.toBuffer(), globalStateInfo.treasuryWallet.toBuffer()],
    NFT_LOAN_PID,
  );

  const treasuryWallet = globalStateInfo.treasuryWallet;
  const ix = createSetSubOfferInstruction(
    {
      borrower: wallet,
      payer: wallet,
      globalState,
      offerMint,
      offer,
      subOffer,
      treasuryVault,
      treasuryWallet,
      ...DEFAULT_PROGRAMS,
    },
    {
      aprNumerator,
      loanDuration: getDurationForContractData(duration, "days"),
      offerAmount: new BN(amount * 10 ** currencies[currencyMints[offerMint.toString()]].decimals),
      subOfferNumber,
    },
    NFT_LOAN_PID,
  );

  return new Transaction().add(ix);
};

export const cancelSubOffer = async (
  connection: Connection,
  wallet: PublicKey,
  subOffer: PublicKey,
): Promise<Transaction> => {
  const subOfferInfo = await SubOffer.fromAccountAddress(connection, subOffer);
  const [offer] = PublicKey.findProgramAddressSync(
    [OFFER_TAG, wallet.toBuffer(), subOfferInfo.nftMint.toBuffer()],
    NFT_LOAN_PID,
  );
  const ix = createCancelSubOfferInstruction(
    {
      borrower: wallet,
      offer,
      subOffer,
    },
    NFT_LOAN_PID,
  );
  return new Transaction().add(ix);
};

export const repayLoan = async (
  connection: Connection,
  wallet: PublicKey,
  subOffer: PublicKey,
): Promise<Transaction> => {
  const subOfferInfo = await SubOffer.fromAccountAddress(connection, subOffer);
  const offer = subOfferInfo.offer;
  const lender = subOfferInfo.lender;
  const nftMint = subOfferInfo.nftMint;
  const offerMint = subOfferInfo.offerMint;

  const [globalState] = PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], NFT_LOAN_PID);
  const globalStateInfo = await GlobalState.fromAccountAddress(connection, globalState);
  const treasuryWallet = globalStateInfo.treasuryWallet;
  const rewardVault = globalStateInfo.rewardVault;

  const [treasuryVault] = PublicKey.findProgramAddressSync(
    [TREASURY_VAULT_TAG, offerMint.toBuffer(), treasuryWallet.toBuffer()],
    NFT_LOAN_PID,
  );
  const [edition] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA.toBuffer(), nftMint.toBuffer(), Buffer.from("edition")],
    METADATA,
  );

  const borrowerNftVault = getAssociatedTokenAddressSync(nftMint, wallet);
  let lenderOfferVault: PublicKey;
  let borrowerOfferVault: PublicKey;

  if (offerMint.equals(NATIVE_MINT)) {
    lenderOfferVault = rewardVault;
    borrowerOfferVault = rewardVault;
  } else {
    lenderOfferVault = getAssociatedTokenAddressSync(offerMint, lender);
    borrowerOfferVault = getAssociatedTokenAddressSync(offerMint, wallet);
  }
  const tx = new Transaction();

  if (!(await isAccountInitialized(connection, lenderOfferVault)))
    tx.add(createAssociatedTokenAccountInstruction(wallet, lenderOfferVault, lender, offerMint));

  if (!(await isAccountInitialized(connection, borrowerOfferVault)))
    tx.add(createAssociatedTokenAccountInstruction(wallet, borrowerOfferVault, wallet, offerMint));

  const ix = createRepayLoanInstruction(
    {
      borrower: wallet,
      globalState,
      offer,
      subOffer,
      lender,
      nftMint,
      edition,
      treasuryWallet,
      treasuryVault,
      rewardVault,
      borrowerOfferVault,
      borrowerNftVault,
      lenderOfferVault,
      ...DEFAULT_PROGRAMS,
      ...CHAINLINK_PROGRAMS,
    },
    NFT_LOAN_PID,
  );

  return new Transaction().add(ix);
};

// Lender actions
export const acceptOffer = async (
  connection: Connection,
  wallet: PublicKey,
  subOffer: PublicKey,
): Promise<Transaction> => {
  const [globalState] = PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], NFT_LOAN_PID);
  const globalStateInfo = await GlobalState.fromAccountAddress(connection, globalState);
  const { rewardVault } = globalStateInfo;

  const subOfferInfo = await SubOffer.fromAccountAddress(connection, subOffer);
  const { offer, borrower, offerMint } = subOfferInfo;

  let lenderOfferVault: PublicKey;
  let borrowerOfferVault: PublicKey;

  if (offerMint.equals(NATIVE_MINT)) {
    lenderOfferVault = rewardVault;
    borrowerOfferVault = rewardVault;
  } else {
    lenderOfferVault = getAssociatedTokenAddressSync(offerMint, wallet);
    borrowerOfferVault = getAssociatedTokenAddressSync(offerMint, borrower);
  }
  const tx = new Transaction();

  if (!(await isAccountInitialized(connection, lenderOfferVault)))
    tx.add(createAssociatedTokenAccountInstruction(wallet, lenderOfferVault, wallet, offerMint));

  if (!(await isAccountInitialized(connection, borrowerOfferVault)))
    tx.add(
      createAssociatedTokenAccountInstruction(wallet, borrowerOfferVault, borrower, offerMint),
    );

  const ix = createAcceptOfferInstruction(
    {
      lender: wallet,
      borrower,
      globalState,
      offer,
      subOffer,
      offerMint,
      rewardVault,
      lenderOfferVault,
      borrowerOfferVault,
      ...CHAINLINK_PROGRAMS,
      ...DEFAULT_PROGRAMS,
    },
    NFT_LOAN_PID,
  );

  return tx.add(ix);
};

export const claimCollateral = async (
  connection: Connection,
  wallet: PublicKey,
  subOffer: PublicKey,
): Promise<Transaction> => {
  const [globalState] = PublicKey.findProgramAddressSync([GLOBAL_STATE_TAG], NFT_LOAN_PID);
  const globalStateInfo = await GlobalState.fromAccountAddress(connection, globalState);
  const { treasuryWallet, rewardVault } = globalStateInfo;

  const subOfferInfo = await SubOffer.fromAccountAddress(connection, subOffer);
  const { offerMint, offer, nftMint, borrower } = subOfferInfo;
  const [edition] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA.toBuffer(), nftMint.toBuffer(), Buffer.from("edition")],
    METADATA,
  );

  const [treasuryVault] = PublicKey.findProgramAddressSync(
    [TREASURY_VAULT_TAG, offerMint.toBuffer(), globalStateInfo.treasuryWallet.toBuffer()],
    NFT_LOAN_PID,
  );

  const lenderNftVault = getAssociatedTokenAddressSync(nftMint, wallet);
  const borrowerNftVault = getAssociatedTokenAddressSync(nftMint, borrower); // Should always exist
  const lenderOfferVault = getAssociatedTokenAddressSync(offerMint, wallet);
  const tx = new Transaction();

  if (!(await isAccountInitialized(connection, lenderNftVault)))
    tx.add(createAssociatedTokenAccountInstruction(wallet, lenderNftVault, wallet, nftMint));

  if (!(await isAccountInitialized(connection, lenderOfferVault)))
    tx.add(createAssociatedTokenAccountInstruction(wallet, lenderOfferVault, wallet, offerMint));

  const ix = createClaimCollateralInstruction(
    {
      lender: wallet,
      globalState,
      offer,
      subOffer,
      nftMint,
      lenderNftVault,
      borrowerNftVault,
      lenderOfferVault,
      rewardVault,
      treasuryWallet,
      treasuryVault,
      edition,
      ...CHAINLINK_PROGRAMS,
      ...DEFAULT_PROGRAMS,
    },
    NFT_LOAN_PID,
  );

  return tx.add(ix);
};

// Utils

export const isAccountInitialized = async (
  connection: Connection,
  account: PublicKey,
): Promise<boolean> => {
  try {
    await getAccount(connection, account);
    return true;
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    )
      return false;
    else throw Error();
  }
};
