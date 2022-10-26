import { Connection, PublicKey } from "@solana/web3.js";
import {
  Offer,
  offerDiscriminator,
  OfferState,
  SubOffer,
  subOfferDiscriminator,
  SubOfferState,
} from "@unloc-dev/unloc-loan-solita";
import BN from "bn.js";

import { NFT_LOAN_PID, SUB_OFFER_TAG } from "@constants/config";
import { gte } from "@utils/bignum";
import { range } from "@utils/common";
import { GmaBuilder } from "@utils/spl/GmaBuilder";
import { OfferAccount, SubOfferAccount } from "@utils/spl/types";

export const getOffersBy = async (
  connection: Connection,
  owner?: PublicKey,
  nftMint?: PublicKey,
  state?: OfferState,
): Promise<Array<{ account: Offer; pubkey: PublicKey }>> => {
  const query = Offer.gpaBuilder(NFT_LOAN_PID);

  query.addFilter("accountDiscriminator", offerDiscriminator);
  if (owner != null) query.addFilter("borrower", owner);
  if (nftMint != null) query.addFilter("nftMint", nftMint);
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
): Promise<PublicKey[]> => {
  const query = SubOffer.gpaBuilder(NFT_LOAN_PID).addFilter(
    "accountDiscriminator",
    subOfferDiscriminator,
  );
  if (options?.state) query.addFilter("state", options.state);
  if (options?.borrower != null) query.addFilter("borrower", options.borrower);
  if (options?.lender != null) query.addFilter("lender", options.lender);
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

export const getSubOffersInRange = async (
  connection: Connection,
  offer: PublicKey,
  range: number[],
  state?: number,
): Promise<Array<{ pubkey: PublicKey; account: SubOffer }>> => {
  const subOfferAddresses = range.map((num) => {
    return PublicKey.findProgramAddressSync(
      [SUB_OFFER_TAG, offer.toBuffer(), new BN(num).toArrayLike(Buffer, "be", 8)],
      NFT_LOAN_PID,
    )[0];
  });

  const data = await connection.getMultipleAccountsInfo(subOfferAddresses);
  return subOfferAddresses.reduce<Array<{ pubkey: PublicKey; account: SubOffer }>>(
    (list, pubkey, i) => {
      const accountInfo = data[i];
      if (accountInfo == null) return list;

      const [account] = SubOffer.fromAccountInfo(accountInfo);
      state
        ? account.state === state && list.push({ pubkey, account })
        : list.push({ pubkey, account });
      return list;
    },
    [],
  );
};

export const getFrontPageSubOffers = async (
  connection: Connection,
): Promise<Array<FlatArray<PublicKey[][], 1>>> => {
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
  return offersWithSubOfferCount
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
};

export const getSubOfferMultiple = async (
  connection: Connection,
  keys: PublicKey[],
  offerState?: OfferState,
): Promise<any[]> => {
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
  for (let i = 0; i < subOffers.length; i++)
    if (subOffers[i]) {
      const offerKey = subOffers[i].account.offer;
      const offer = offers.find(({ pubkey }) => pubkey.equals(offerKey));
      if (offer == null) continue;

      // If we want to, check the offer state too.
      // Suboffer can be proposed when the offer isn't, so that's why we check the state on the offer, not just the suboffer.
      // Be careful, offerState = 0 can coerce to false.
      if (typeof offerState === "number") {
        if (
          gte(subOffers[i].account.subOfferNumber, offer.account.startSubOfferNum) &&
          offer.account.state === offerState
        )
          result.push(subOffers[i]);
      } else if (gte(subOffers[i].account.subOfferNumber, offer.account.startSubOfferNum))
        result.push(subOffers[i]);
    }

  return result;
};
