import * as anchor from "@project-serum/anchor";
import { IDL as idl, UnlocNftLoan } from "./unloc_nft_loan";
import { NFT_LOAN_PID, RPC_ENDPOINT, SUB_OFFER_TAG } from "@constants/config";
import BN from "bn.js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

import {
  Offer,
  offerDiscriminator,
  OfferState,
  SubOffer,
  subOfferDiscriminator,
  SubOfferState,
} from "@unloc-dev/unloc-loan-solita";
import { range } from "@utils/common";
import { OfferAccount, SubOfferAccount } from "@utils/spl/types";
import { gte } from "@utils/bignum";
import { GmaBuilder } from "@utils/spl/GmaBuilder";

const SOLANA_CONNECTION = new Connection(RPC_ENDPOINT, {
  disableRetryOnRateLimit: true,
});

export let program: anchor.Program<UnlocNftLoan> = null as unknown as anchor.Program<UnlocNftLoan>;
export let programId: anchor.web3.PublicKey = null as unknown as anchor.web3.PublicKey;

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

export const getOffersBy = async (
  owner?: anchor.web3.PublicKey,
  nftMint?: anchor.web3.PublicKey,
  state?: OfferState,
) => {
  const connection = program?.provider?.connection ?? new Connection(clusterApiUrl("devnet"));
  const query = Offer.gpaBuilder(NFT_LOAN_PID);

  query.addFilter("accountDiscriminator", offerDiscriminator);
  if (owner) query.addFilter("borrower", owner);
  if (nftMint) query.addFilter("nftMint", nftMint);
  if (state) query.addFilter("state", state);

  const accountInfos = await query.run(connection);
  return accountInfos.map((data) => ({
    pubkey: data.pubkey,
    account: Offer.fromAccountInfo(data.account)[0],
  }));
};

export const getSubOfferKeys = async (
  connection: Connection,
  options?: {
    state?: SubOfferState;
    borrower?: PublicKey;
    lender?: PublicKey;
  },
) => {
  const query = SubOffer.gpaBuilder(NFT_LOAN_PID).addFilter(
    "accountDiscriminator",
    subOfferDiscriminator,
  );
  if (options?.state) query.addFilter("state", options.state);
  if (options?.borrower) query.addFilter("borrower", options.borrower);
  if (options?.lender) query.addFilter("lender", options.lender);
  query.config.dataSlice = {
    length: 8,
    offset: 8 + 1 + 3 * 32 + 2 + 32 + 8 + 2 * 32 + 8 * 8,
  };

  // This configuration ensures that we fetch no data with this request, only the pubkeys
  // The reasoning is that GPA requests are already heavy and not supported by
  // public RPCs, so we will use the more optimized "getMultipleAccounts" request
  // for getting the actual data.

  const accounts = await query.run(connection);
  const accountsWithCreationDate = accounts.map(({ pubkey, account }) => ({
    pubkey,
    createdOn: new BN(account.data, "le"),
  }));
  const sortedAccountsWithCreationDate = accountsWithCreationDate.sort((a, b) =>
    b.createdOn.cmp(a.createdOn),
  );
  return sortedAccountsWithCreationDate.map((account) => account.pubkey);
};

export const getSubOffersInRange = async (offer: PublicKey, range: number[], state?: number) => {
  const connection = program?.provider?.connection ?? new Connection(clusterApiUrl("devnet"));
  const subOfferAddresses = range.map((num) => {
    return PublicKey.findProgramAddressSync(
      [SUB_OFFER_TAG, offer.toBuffer(), new BN(num).toArrayLike(Buffer, "be", 8)],
      NFT_LOAN_PID,
    )[0];
  });

  const data = await connection.getMultipleAccountsInfo(subOfferAddresses);
  return subOfferAddresses.reduce<{ pubkey: PublicKey; account: SubOffer }[]>((list, pubkey, i) => {
    const accountInfo = data[i];
    if (!accountInfo) {
      return list;
    }
    const [account] = SubOffer.fromAccountInfo(accountInfo);
    state
      ? account.state === state && list.push({ pubkey, account })
      : list.push({ pubkey, account });
    return list;
  }, []);
};

export const getFrontPageSubOffers = async (connection: Connection) => {
  const offerQuery = Offer.gpaBuilder(NFT_LOAN_PID)
    .addFilter("state", OfferState.Proposed)
    // Weird bug, I shouldn't need to specify this.
    // Otherwise, this also fetches the global_state account
    .addFilter("accountDiscriminator", offerDiscriminator);

  offerQuery.config.dataSlice = { length: 16, offset: 8 + 1 + 32 * 3 + 1 };

  const offersWithSubOfferCount = (await offerQuery.run(connection)).map(({ pubkey, account }) => ({
    pubkey,
    subOfferCount: new BN(account.data.subarray(0, 8), "le"),
    startSubOfferCount: new BN(account.data.subarray(8), "le"),
  }));

  // Get all suboffer addresses
  const subOfferKeys = offersWithSubOfferCount
    .map(({ pubkey, subOfferCount, startSubOfferCount }) => {
      const subOfferRange = range(startSubOfferCount.toNumber(), subOfferCount.toNumber());
      return subOfferRange.map((num) => {
        return PublicKey.findProgramAddressSync(
          [SUB_OFFER_TAG, pubkey.toBuffer(), new BN(num).toArrayLike(Buffer, "be", 8)],
          NFT_LOAN_PID,
        )[0];
      });
    })
    .flat();
  return subOfferKeys;
};

export const getSubOfferMultiple = async (
  connection: Connection,
  keys: PublicKey[],
  offerState?: OfferState,
) => {
  const subOffers = (
    await GmaBuilder.make(connection, keys, { commitment: "confirmed" }).getAndMap((account) => {
      if (!account.exists) return null;
      return { pubkey: account.publicKey, account: SubOffer.deserialize(account.data)[0] };
    })
  ).filter((account): account is SubOfferAccount => account !== null);

  const offerKeys = [...new Set(subOffers.map(({ account }) => account.offer))];
  const offers = (
    await GmaBuilder.make(connection, offerKeys, {
      commitment: "confirmed",
    }).getAndMap((account) => {
      if (!account.exists) return null;
      return { pubkey: account.publicKey, account: Offer.deserialize(account.data)[0] };
    })
  ).filter((account): account is OfferAccount => account !== null);

  const result = [];
  for (let i = 0; i < subOffers.length; i++) {
    if (subOffers[i]) {
      const offerKey = subOffers[i].account.offer;
      const offer = offers.find(({ pubkey }) => pubkey.equals(offerKey));
      if (!offer) continue;

      // If we want to, check the offer state too.
      // Suboffer can be proposed when the offer isn't, so that's why we check the state on the offer, not just the suboffer.
      // Be careful, offerState = 0 can coerce to false.
      if (typeof offerState === "number") {
        if (
          gte(subOffers[i].account.subOfferNumber, offer.account.startSubOfferNum) &&
          offer.account.state === offerState
        ) {
          result.push(subOffers[i]);
        }
      } else {
        if (gte(subOffers[i].account.subOfferNumber, offer.account.startSubOfferNum)) {
          result.push(subOffers[i]);
        }
      }
    }
  }
  return result;
};
