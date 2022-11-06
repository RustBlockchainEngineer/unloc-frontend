import { Connection, PublicKey } from "@solana/web3.js";
import {
  Offer,
  offerDiscriminator,
  OfferState,
  SubOffer,
  subOfferDiscriminator,
  SubOfferState,
} from "@unloc-dev/unloc-sdk-loan";
import BN from "bn.js";

import { NFT_LOAN_PID, SUB_OFFER_TAG } from "@constants/config";
import { notEmpty, range } from "@utils/common";
import { GmaBuilder } from "@utils/spl/GmaBuilder";

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
): Promise<Array<{ pubkey: PublicKey; account: SubOffer }>> => {
  const subOfferAddresses = range.map((num) => {
    return PublicKey.findProgramAddressSync(
      [SUB_OFFER_TAG, offer.toBuffer(), new BN(num).toArrayLike(Buffer, "be", 8)],
      NFT_LOAN_PID,
    )[0];
  });

  return (
    await GmaBuilder.make(connection, subOfferAddresses).getAndMap((acc) => {
      if (!acc.exists) return null;
      return { pubkey: acc.publicKey, account: SubOffer.deserialize(acc.data)[0] };
    })
  ).filter(notEmpty);
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

export const getSubOfferMultiple = async (connection: Connection, keys: PublicKey[]) => {
  const subOffers = (
    await GmaBuilder.make(connection, keys, { commitment: "confirmed" }).getAndMap((account) => {
      if (!account.exists) return null;
      return { pubkey: account.publicKey, account: SubOffer.deserialize(account.data)[0] };
    })
  ).filter(notEmpty);

  const offerKeys = [...new Set(subOffers.map(({ account }) => account.offer))];
  const offers = (
    await GmaBuilder.make(connection, offerKeys, {
      commitment: "confirmed",
    }).getAndMap((account) => {
      if (!account.exists) return null;
      return { pubkey: account.publicKey, account: Offer.deserialize(account.data)[0] };
    })
  ).filter(notEmpty);

  const result: typeof subOffers = [];
  // TODO: am I missing some check here or filter?
  for (let i = 0; i < subOffers.length; i++) {
    const offerKey = subOffers[i].account.offer;
    const offer = offers.find(({ pubkey }) => pubkey.equals(offerKey));
    if (!offer) continue;
    result.push(subOffers[i]);
  }
  return result;
};
