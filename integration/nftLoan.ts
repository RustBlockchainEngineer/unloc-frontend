import * as anchor from "@project-serum/anchor";
import { bool, publicKey, struct, u32, u64, u8 } from "@project-serum/borsh";
import { NATIVE_MINT, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL as idl, UnlocNftLoan } from "./unloc_nft_loan";
import { NFT_LOAN_PID, RPC_ENDPOINT } from "@constants/config";
import {
  Connection,
  Keypair,
  MemcmpFilter,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  Edition,
  MasterEdition,
  Metadata,
  MetadataData,
  MetadataKey,
} from "@metaplex-foundation/mpl-token-metadata";
import axios from "axios";

import { IArweaveMetadata, IMasterEdition, IMetadata, IOnChainMetadata } from "../@types/nfts/nft";
import { SubOffer, SubOfferAccount } from "../@types/loans";

const SOLANA_CONNECTION = new Connection(RPC_ENDPOINT, {
  disableRetryOnRateLimit: true,
});

export let program: anchor.Program<UnlocNftLoan> = null as unknown as anchor.Program<UnlocNftLoan>;
export let programId: anchor.web3.PublicKey = null as unknown as anchor.web3.PublicKey;

const systemProgram = anchor.web3.SystemProgram.programId;
const tokenProgram = TOKEN_PROGRAM_ID;
const rent = anchor.web3.SYSVAR_RENT_PUBKEY;
const clock = anchor.web3.SYSVAR_CLOCK_PUBKEY;
const defaults = {
  systemProgram,
  tokenProgram,
  rent,
  clock,
};

const GLOBAL_STATE_TAG = Buffer.from("GLOBAL_STATE_SEED");
const OFFER_TAG = Buffer.from("OFFER_SEED");
const SUB_OFFER_TAG = Buffer.from("SUB_OFFER_SEED");
const OFFER_VAULT_TAG = Buffer.from("OFFER_VAULT_SEED");
const TREASURY_VAULT_TAG = Buffer.from("TREASURY_VAULT_SEED");
const REWARD_VAULT_TAG = Buffer.from("REWARD_VAULT_SEED");
const METADATA_TAG = Buffer.from("metadata");
const EDITION_TAG = Buffer.from("edition");

const WSOL_MINT = new anchor.web3.PublicKey("So11111111111111111111111111111111111111112");
const METADATA_PROGRAM = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const CHAINLINK_AGGREGATOR_PROGRAM_ID = new anchor.web3.PublicKey(
  "cjg3oHmg9uuPsP8D6g29NWvhySJkdYdAo9D25PRbKXJ",
);

export const CHAINLINK_SOL_FEED = new PublicKey("CcPVS9bqyXbD9cLnTbhhHazLsrua8QMFUHTutPtjyDzq");
export const CHAINLINK_USDC_FEED = new PublicKey("7CLo1BY41BHAVnEs57kzYMnWXyBJrVEBPpZyQyPo2p1G");
export const CHAINLINK_PID = new PublicKey(CHAINLINK_AGGREGATOR_PROGRAM_ID);
export const chainlinkIds = {
  chainlinkProgram: CHAINLINK_PID,
  solFeed: CHAINLINK_SOL_FEED,
  usdcFeed: CHAINLINK_USDC_FEED,
};

// This command makes an Lottery
export const initLoanProgram = (
  // connection: anchor.web3.Connection,
  wallet: any,
  pid: anchor.web3.PublicKey = NFT_LOAN_PID,
) => {
  if (program != null) {
    return;
  }
  programId = pid;
  // const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions())
  const provider = new anchor.Provider(SOLANA_CONNECTION, wallet, { skipPreflight: true });

  // Generate the program client from IDL.
  program = new (anchor as any).Program(idl, programId, provider) as anchor.Program<UnlocNftLoan>;
};
// initLoanProgram(SOLANA_CONNECTION, Keypair.generate())

export const getGlobalState = async () => {
  const globalState = await pda([GLOBAL_STATE_TAG], programId);
  return await program.account.globalState.fetchNullable(globalState);
};

export const getOfferList = async () => {
  return await program.account.offer.all();
};

export const getOfferMultiple = async (keys: anchor.web3.PublicKey[]) => {
  return await program.account.offer.fetchMultiple(keys);
};

export const getOffer = async (key: anchor.web3.PublicKey) => {
  return await program.account.offer.fetchNullable(key);
};

export const getOffersBy = async (
  owner?: anchor.web3.PublicKey,
  nftMint?: anchor.web3.PublicKey,
  state?: OfferState,
) => {
  const accountName = "offer";
  const discriminator = anchor.AccountsCoder.accountDiscriminator(accountName);
  const filters: any[] = [];

  if (owner) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length,
        bytes: owner.toBase58(),
      },
    };
    filters.push(filter);
  }
  if (nftMint) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 32,
        bytes: nftMint.toBase58(),
      },
    };
    filters.push(filter);
  }
  if (state) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 96,
        bytes: bs58.encode([state]),
      },
    };
    filters.push(filter);
  }

  return await program.account.offer.all(filters);
};

export const getSubOffer = async (key: anchor.web3.PublicKey) => {
  const subOffer = await program.account.subOffer.fetchNullable(key);
  if (subOffer) {
    const offerKey = subOffer.offer;
    const offerData = await program.account.offer.fetch(offerKey);
    if (offerData.startSubOfferNum.toNumber() > subOffer.subOfferNumber.toNumber()) {
      return null;
    }
  }
  return subOffer;
};

export const getSubOffersInRange = async (
  offer: PublicKey,
  range: number[],
  state?: number,
): Promise<SubOfferAccount[]> => {
  const subOfferAddresses = await Promise.all(
    range.map(async (num) => {
      return pda(
        [SUB_OFFER_TAG, offer.toBuffer(), new anchor.BN(num).toArrayLike(Buffer, "be", 8)],
        program.programId,
      );
    }),
  );

  const data = await program.account.subOffer.fetchMultiple(subOfferAddresses);
  return subOfferAddresses.reduce<SubOfferAccount[]>((list, publicKey, i) => {
    const account = data[i] as SubOffer;
    if (account) {
      state
        ? account.state === state && list.push({ publicKey, account })
        : list.push({ publicKey, account });
    }
    return list;
  }, []);
};

export const getSubOfferMultiple = async (keys: anchor.web3.PublicKey[], offerState?: number) => {
  const subOffers: any[] = await program.account.subOffer.fetchMultiple(keys);

  // Filter for nulls and get the offer address
  const offerAddresses = subOffers.filter((subOffer) => subOffer).map((subOffer) => subOffer.offer);

  // Get all offer data in a single call instead of a loop, filter for nulls
  const offers: any[] = (await program.account.offer.fetchMultiple(offerAddresses)).filter(
    (data) => data,
  );

  const result = [];
  for (let i = 0; i < subOffers.length; i++) {
    if (subOffers[i]) {
      const offerKey = subOffers[i].offer;
      const offerKeyIndex = offerAddresses.findIndex((address) => address.equals(offerKey));
      const offerData = offers[offerKeyIndex];

      // If we want to, check the offer state too.
      // Suboffer can be proposed when the offer isn't, so that's why we check the state on the offer, not just the suboffer.
      // Be careful, offerState = 0 can coerce to false.
      if (typeof offerState === "number") {
        if (
          offerData.startSubOfferNum.toNumber() <= subOffers[i].subOfferNumber.toNumber() &&
          offerData.state === offerState
        ) {
          result.push({ ...subOffers[i], subOfferKey: keys[i] });
        }
      } else {
        if (offerData.startSubOfferNum.toNumber() <= subOffers[i].subOfferNumber.toNumber()) {
          result.push({ ...subOffers[i], subOfferKey: keys[i] });
        }
      }
    }
  }
  return result;
};

export const setGlobalState = async (
  accruedInterestNumerator: anchor.BN,
  denominator: anchor.BN,
  aprNumerator: anchor.BN,
  expireDurationForLenader: anchor.BN,
  rewardRate: anchor.BN,
  lenderRewardsPercentage: anchor.BN,
  rewardMint: anchor.web3.PublicKey,
  treasury: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  const superOwner = signer;
  const globalState = await pda([GLOBAL_STATE_TAG], programId);
  const rewardVault = await pda([REWARD_VAULT_TAG], programId);

  const tx = await program.rpc.setGlobalState(
    accruedInterestNumerator,
    denominator,
    aprNumerator,
    expireDurationForLenader,
    rewardRate,
    lenderRewardsPercentage,
    {
      accounts: {
        superOwner,
        globalState,
        rewardMint,
        rewardVault,
        newSuperOwner: superOwner,
        treasuryWallet: treasury,
        ...defaults,
      },
      signers,
    },
  );

  // eslint-disable-next-line no-console
  console.log("setGlobalState tx = ", tx);
};

export const setOffer = async (
  nftMint: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  const borrowerNftVault: anchor.web3.PublicKey = await checkWalletATA(
    nftMint.toBase58(),
    program.provider.connection,
    signer,
  );

  const borrower = signer;
  const offer = await pda([OFFER_TAG, borrower.toBuffer(), nftMint.toBuffer()], programId);
  const nftMetadata = await pda(
    [METADATA_TAG, METADATA_PROGRAM.toBytes(), nftMint.toBuffer()],
    METADATA_PROGRAM,
  );
  const edition = await pda(
    [METADATA_TAG, METADATA_PROGRAM.toBytes(), nftMint.toBuffer(), EDITION_TAG],
    METADATA_PROGRAM,
  );

  const tx = await program.rpc.setOffer({
    accounts: {
      borrower,
      offer,
      nftMint,
      nftMetadata,
      edition,
      userVault: borrowerNftVault,
      metadataProgram: METADATA_PROGRAM,
      ...defaults,
    },
    signers,
  });

  // eslint-disable-next-line no-console
  console.log("setOffer tx = ", tx);
};
export const addTokenAccountInstruction = async (
  mint: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey,
  instructions: TransactionInstruction[],
  signer: anchor.web3.PublicKey,
  signers: anchor.web3.Keypair[],
  rent: number = 0,
) => {
  const newKeypair = Keypair.generate();
  const rentForTokenAccount = await Token.getMinBalanceRentForExemptAccount(
    program.provider.connection,
  );
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: signer,
      newAccountPubkey: newKeypair.publicKey,
      lamports: rent > 0 ? rent : rentForTokenAccount,
      space: ACCOUNT_LAYOUT.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  const instruction = Token.createInitAccountInstruction(
    TOKEN_PROGRAM_ID,
    mint,
    newKeypair.publicKey,
    owner,
  );
  instructions.push(instruction);
  signers.push(newKeypair);
  return newKeypair.publicKey;
};
export const cancelOffer = async (
  nftMint: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  const borrower = signer;
  const offer = await pda([OFFER_TAG, borrower.toBuffer(), nftMint.toBuffer()], programId);
  let borrowerNftVault = await checkWalletATA(nftMint.toBase58());
  const preInstructions: TransactionInstruction[] = [];
  if (!borrowerNftVault) {
    borrowerNftVault = await addTokenAccountInstruction(
      nftMint,
      borrower,
      preInstructions,
      signer,
      signers,
    );
  }

  const edition = await pda(
    [METADATA_TAG, METADATA_PROGRAM.toBytes(), nftMint.toBuffer(), EDITION_TAG],
    METADATA_PROGRAM,
  );

  const tx = await program.rpc.cancelOffer({
    accounts: {
      borrower,
      offer,
      nftMint,
      edition,
      userVault: borrowerNftVault,
      metadataProgram: METADATA_PROGRAM,
      ...defaults,
    },
    preInstructions,
    signers,
  });

  // eslint-disable-next-line no-console
  console.log("cancelOffer tx = ", tx);
};

export const createSubOffer = async (
  offerAmount: anchor.BN,
  loanDuration: anchor.BN,
  minRepaidNumerator: anchor.BN,
  aprNumerator: anchor.BN,
  nftMint: anchor.web3.PublicKey,
  offerMint: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  if (offerMint.equals(NATIVE_MINT)) {
    offerMint = WSOL_MINT;
  }
  const globalState = await pda([GLOBAL_STATE_TAG], programId);
  const borrower = signer;
  const offer = await pda([OFFER_TAG, borrower.toBuffer(), nftMint.toBuffer()], programId);
  const offerData = await program.account.offer.fetch(offer);
  const subOfferNumer = offerData.subOfferCount;
  const subOffer = await pda(
    [SUB_OFFER_TAG, offer.toBuffer(), subOfferNumer.toArrayLike(Buffer, "be", 8)],
    programId,
  );
  const treasuryVault = await pda([TREASURY_VAULT_TAG, offerMint.toBuffer()], programId);
  const globalStateData = await program.account.globalState.fetch(globalState);

  const treasuryWallet = globalStateData.treasuryWallet;
  const tx = await program.rpc.setSubOffer(
    offerAmount,
    subOfferNumer,
    loanDuration,
    minRepaidNumerator,
    aprNumerator,
    {
      accounts: {
        borrower,
        globalState,
        offer,
        subOffer,
        offerMint,
        treasuryWallet,
        treasuryVault,
        ...defaults,
      },
      signers,
    },
  );

  // eslint-disable-next-line no-console
  console.log("createSubOffer tx = ", tx);
};

export const updateSubOffer = async (
  offerAmount: anchor.BN,
  loanDuration: anchor.BN,
  minRepaidNumerator: anchor.BN,
  aprNumerator: anchor.BN,

  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  const globalState = await pda([GLOBAL_STATE_TAG], programId);
  const borrower = signer;
  const subOfferData = await program.account.subOffer.fetch(subOffer);
  const offer = await pda(
    [OFFER_TAG, borrower.toBuffer(), subOfferData.nftMint.toBuffer()],
    programId,
  );
  const subOfferNumer = subOfferData.subOfferNumber;
  const offerMint = subOfferData.offerMint;
  const treasuryVault = await pda(
    [TREASURY_VAULT_TAG, subOfferData.offerMint.toBuffer()],
    programId,
  );
  const globalStateData = await program.account.globalState.fetch(globalState);

  const treasuryWallet = globalStateData.treasuryWallet;
  const tx = await program.rpc.setSubOffer(
    offerAmount,
    subOfferNumer,
    loanDuration,
    minRepaidNumerator,
    aprNumerator,
    {
      accounts: {
        borrower,
        globalState,
        offer,
        subOffer,
        offerMint,
        treasuryWallet,
        treasuryVault,
        ...defaults,
      },
      signers,
    },
  );

  // eslint-disable-next-line no-console
  console.log("updateSubOffer tx = ", tx);
};

export const cancelSubOffer = async (
  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  const borrower = signer;
  const subOfferData = await program.account.subOffer.fetch(subOffer);
  const offer = await pda(
    [OFFER_TAG, borrower.toBuffer(), subOfferData.nftMint.toBuffer()],
    programId,
  );
  const tx = await program.rpc.cancelSubOffer({
    accounts: {
      borrower,
      offer,
      subOffer,
    },
    signers,
  });

  // eslint-disable-next-line no-console
  console.log("cancelSubOffer tx = ", tx);
};

export const acceptOffer = async (
  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  const lender = signer;
  const globalState = await pda([GLOBAL_STATE_TAG], programId);
  const rewardVault = await pda([REWARD_VAULT_TAG], programId);
  const subOfferData = await program.account.subOffer.fetch(subOffer);
  const offer = subOfferData.offer;
  const offerMint = subOfferData.offerMint;
  const offerData = await program.account.offer.fetch(subOfferData.offer);
  const borrower = offerData.borrower;
  let borrowerOfferVault = await checkWalletATA(
    offerMint.toBase58(),
    program.provider.connection,
    borrower,
  );
  let lenderOfferVault = await checkWalletATA(
    offerMint.toBase58(),
    program.provider.connection,
    lender,
  );
  const preInstructions: TransactionInstruction[] = [];
  const postInstructions: TransactionInstruction[] = [];
  if (offerMint.equals(WSOL_MINT)) {
    const treasuryVault = await pda([TREASURY_VAULT_TAG, offerMint.toBuffer()], programId);
    lenderOfferVault = treasuryVault;
    borrowerOfferVault = treasuryVault;
  } else {
    if (!borrowerOfferVault) {
      console.log("borrower doesn't have offer token account!");
      borrowerOfferVault = await addTokenAccountInstruction(
        offerMint,
        borrower,
        preInstructions,
        signer,
        signers,
      );
    }
    if (!lenderOfferVault) {
      console.log("lender doesn't have offer token!");
      return;
    }
  }

  const tx = await program.rpc.acceptOffer({
    accounts: {
      lender,
      borrower,
      globalState,
      offer,
      subOffer,
      offerMint,
      borrowerOfferVault,
      lenderOfferVault,
      rewardVault,
      ...chainlinkIds,
      ...defaults,
    },
    preInstructions,
    postInstructions,
    signers,
  });

  // eslint-disable-next-line no-console
  console.log("acceptOffer tx = ", tx);
};

export const repayLoan = async (
  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  const borrower = signer;
  const globalState = await pda([GLOBAL_STATE_TAG], programId);
  const rewardVault = await pda([REWARD_VAULT_TAG], programId);
  const globalStateData = await program.account.globalState.fetch(globalState);
  const treasuryWallet = globalStateData.treasuryWallet;
  const subOfferData = await program.account.subOffer.fetch(subOffer);
  const offer = subOfferData.offer;
  const lender = subOfferData.lender;
  const offerData = await program.account.offer.fetch(offer);
  const offerMint = subOfferData.offerMint;
  const nftMint = offerData.nftMint;
  const treasuryVault = await pda([TREASURY_VAULT_TAG, offerMint.toBuffer()], programId);
  const edition = await pda(
    [METADATA_TAG, METADATA_PROGRAM.toBytes(), nftMint.toBuffer(), EDITION_TAG],
    METADATA_PROGRAM,
  );

  let borrowerOfferVault = await checkWalletATA(
    offerMint.toBase58(),
    program.provider.connection,
    borrower,
  );
  let borrowerNftVault = await checkWalletATA(
    nftMint.toBase58(),
    program.provider.connection,
    borrower,
  );
  let lenderOfferVault = await checkWalletATA(
    offerMint.toBase58(),
    program.provider.connection,
    lender,
  );
  const preInstructions: TransactionInstruction[] = [];
  const postInstructions: TransactionInstruction[] = [];
  if (offerMint.equals(WSOL_MINT)) {
    const treasuryVault = await pda([TREASURY_VAULT_TAG, offerMint.toBuffer()], programId);
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
      nftMint,
      borrower,
      preInstructions,
      signer,
      signers,
    );
  }
  if (!lenderOfferVault) {
    console.log("lender doesn't have offer token account!", lender.toBase58());
    lenderOfferVault = await addTokenAccountInstruction(
      offerMint,
      lender,
      preInstructions,
      signer,
      signers,
    );
  }
  const tx = await program.rpc.repayLoan({
    accounts: {
      borrower,
      lender,
      globalState,
      treasuryWallet,
      offer,
      subOffer,
      nftMint,
      edition,
      rewardVault,
      borrowerNftVault,
      lenderOfferVault,
      borrowerOfferVault,
      treasuryVault,
      metadataProgram: METADATA_PROGRAM,
      ...chainlinkIds,
      ...defaults,
    },
    preInstructions,
    postInstructions,
    signers,
  });

  // eslint-disable-next-line no-console
  console.log("repayLoan tx = ", tx);
};
export const claimCollateral = async (
  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = [],
) => {
  const lender = signer;
  const globalState = await pda([GLOBAL_STATE_TAG], programId);
  const rewardVault = await pda([REWARD_VAULT_TAG], programId);
  const globalStateData = await program.account.globalState.fetch(globalState);
  const treasuryWallet = globalStateData.treasuryWallet;
  const subOfferData = await program.account.subOffer.fetch(subOffer);
  const offer = subOfferData.offer;
  const offerData = await program.account.offer.fetch(offer);
  const offerMint = subOfferData.offerMint;
  const nftMint = offerData.nftMint;
  const treasuryVault = await pda([TREASURY_VAULT_TAG, offerMint.toBuffer()], programId);

  const edition = await pda(
    [METADATA_TAG, METADATA_PROGRAM.toBytes(), nftMint.toBuffer(), EDITION_TAG],
    METADATA_PROGRAM,
  );

  let lenderNftVault = await checkWalletATA(
    nftMint.toBase58(),
    program.provider.connection,
    lender,
  );
  let borrowerNftVault = await checkWalletATA(
    nftMint.toBase58(),
    program.provider.connection,
    offerData.borrower,
  );
  let lenderOfferVault = await checkWalletATA(
    offerMint.toBase58(),
    program.provider.connection,
    lender,
  );
  const preInstructions: TransactionInstruction[] = [];
  const postInstructions: TransactionInstruction[] = [];
  if (offerMint.equals(WSOL_MINT)) {
    const treasuryVault = await pda([TREASURY_VAULT_TAG, offerMint.toBuffer()], programId);
    lenderOfferVault = treasuryVault;
  }

  if (!lenderNftVault) {
    console.log("lender doesn't have nft token token account!");
    lenderNftVault = await addTokenAccountInstruction(
      nftMint,
      lender,
      preInstructions,
      signer,
      signers,
    );
  }
  if (!lenderOfferVault) {
    console.log("lender doesn't have offer token account!", lender.toBase58());
    lenderOfferVault = await addTokenAccountInstruction(
      offerMint,
      lender,
      preInstructions,
      signer,
      signers,
    );
  }
  const tx = await program.rpc.claimCollateral({
    accounts: {
      lender,
      globalState,
      treasuryWallet,
      offer,
      subOffer,
      nftMint,
      edition,
      lenderNftVault,
      borrowerNftVault,
      lenderOfferVault,
      treasuryVault,
      rewardVault,
      metadataProgram: METADATA_PROGRAM,
      ...chainlinkIds,
      ...defaults,
    },
    preInstructions,
    postInstructions,
    signers,
  });

  // eslint-disable-next-line no-console
  console.log("claimCollateral tx = ", tx);
};

export async function pda(seeds: (Buffer | Uint8Array)[], pid: anchor.web3.PublicKey) {
  const [pdaKey] = await anchor.web3.PublicKey.findProgramAddress(seeds, pid);
  return pdaKey;
}

export enum OfferState {
  Proposed,
  Accepted,
  Expired,
  Fulfilled,
  NFTClaimed,
  Canceled,
}

export enum SubOfferState {
  Proposed,
  Accepted,
  Expired,
  Fulfilled,
  LoanPaymentClaimed,
  Canceled,
}

export const checkWalletATA = async (
  mint: string,
  connection: anchor.web3.Connection = program.provider.connection,
  walletPubkey: anchor.web3.PublicKey = program.provider.wallet.publicKey,
) => {
  const parsedTokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletPubkey,
    {
      programId: TOKEN_PROGRAM_ID,
    },
    "confirmed",
  );
  let result: any = null;
  let maxAmount = 0;
  parsedTokenAccounts.value.forEach(async (tokenAccountInfo) => {
    const tokenAccountPubkey = tokenAccountInfo.pubkey;
    const parsedInfo = tokenAccountInfo.account.data.parsed.info;
    const mintAddress = parsedInfo.mint;
    const amount = parsedInfo.tokenAmount.uiAmount;
    if (mintAddress === mint && amount >= maxAmount) {
      result = tokenAccountPubkey;
      maxAmount = amount;
    }
  });

  return result;
};

export const logObject = (title: string, obj: any) => {
  console.log(title, obj);
};
export const getOfferBalance = async (
  subOffer: anchor.web3.PublicKey,
  connection: anchor.web3.Connection = program.provider.connection,
) => {
  try {
    const tokenAccount = await pda([OFFER_VAULT_TAG, subOffer.toBuffer()], programId);
    const balance = (await connection.getTokenAccountBalance(tokenAccount)).value
      .uiAmount as number;
    return balance;
  } catch (e) {
    console.log(e);
  }
  return 0;
};
// --------------------utilities---------------------

export class MultipleNFT {
  public mints: anchor.web3.PublicKey[];
  public metadatas: NFTMetadata[] = [];
  constructor(keys: anchor.web3.PublicKey[]) {
    this.mints = keys;
  }
  public async initialize() {
    if (this.metadatas.length == 0) {
      const metadataPDAs: PublicKey[] = [];
      for (let i = 0; i < this.mints.length; i++) {
        const metadataPDA = await Metadata.getPDA(this.mints[i]);
        metadataPDAs.push(metadataPDA);
      }
      let i = 0;
      const metaInfos = await Metadata.getInfos(program.provider.connection, metadataPDAs);
      metaInfos.forEach((value: anchor.web3.AccountInfo<Buffer>) => {
        const metadata = MetadataData.deserialize(value.data);
        const nftMetadata = new NFTMetadata(this.mints[i], metadataPDAs[i], metadata);
        this.metadatas.push(nftMetadata);
        i++;
      });
    }
  }
  public getNftMeta(mint: PublicKey) {
    for (let i = 0; i < this.metadatas.length; i++) {
      if (this.metadatas[i].mint === mint.toBase58()) {
        return this.metadatas[i];
      }
    }
    return null;
  }
  public async initArweavedata() {
    for (let i = 0; i < this.metadatas.length; i++) {
      await this.metadatas[i].getAreaveMetadata();
    }
  }
}

export class NFTMetadata implements IMetadata {
  mint = "";
  metadataPDA = "";
  onChainMetadata: IOnChainMetadata = null as any;
  arweaveMetadata: IArweaveMetadata = null as any;
  masterEdition: IMasterEdition = null as any;
  constructor(
    mint: anchor.web3.PublicKey,
    metadataPDA: anchor.web3.PublicKey,
    onChainMetadata: IOnChainMetadata,
  ) {
    this.mint = mint.toBase58();
    this.metadataPDA = metadataPDA.toBase58();
    this.onChainMetadata = onChainMetadata;
  }

  public async getAreaveMetadata() {
    if (this.arweaveMetadata === null) {
      try {
        const arweaveData = await axios.get(this.onChainMetadata.data.uri);
        if (arweaveData) {
          this.arweaveMetadata = arweaveData.data;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    }
    return this.arweaveMetadata;
  }
  public currentAreaveMetadata() {
    return this.arweaveMetadata;
  }
  public async getMasterEdition() {
    if (this.arweaveMetadata === null) {
      const masterEditionPDA = await Edition.getPDA(new PublicKey(this.mint));
      const editionAccountInfo = await program.provider.connection.getAccountInfo(masterEditionPDA);

      if (editionAccountInfo) {
        const key = editionAccountInfo?.data[0];
        let masterEditionData;
        let data;

        switch (key) {
          case MetadataKey.MasterEditionV1:
          case MetadataKey.MasterEditionV2:
            ({ data } = new MasterEdition(masterEditionPDA, editionAccountInfo));
            masterEditionData = data;
            break;
          default:
            masterEditionData = undefined;
            break;
        }

        this.masterEdition = {
          masterEditionPDA: masterEditionPDA.toString(),
          masterEditionData,
        };
      }
    }
    return this.masterEdition;
  }
}
export const ACCOUNT_LAYOUT = struct([
  publicKey("mint"),
  publicKey("owner"),
  u64("amount"),
  u32("delegateOption"),
  publicKey("delegate"),
  u8("state"),
  u32("isNativeOption"),
  u64("isNative"),
  u64("delegatedAmount"),
  u32("closeAuthorityOption"),
  publicKey("closeAuthority"),
]);

export const MINT_LAYOUT = struct([
  u32("mintAuthorityOption"),
  publicKey("mintAuthority"),
  u64("supply"),
  u8("decimals"),
  bool("initialized"),
  u32("freezeAuthorityOption"),
  publicKey("freezeAuthority"),
]);
