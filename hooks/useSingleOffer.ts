import { useCallback, useEffect, useState } from "react";

import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Offer, SubOffer } from "@unloc-dev/unloc-loan-solita";
import BN from "bn.js";

import { NFT_LOAN_PID, SUB_OFFER_TAG } from "@constants/config";
import { range } from "@utils/common";
import { GmaBuilder } from "@utils/spl/GmaBuilder";
import { findMetadataPda } from "@utils/spl/metadata";
import { SubOfferAccount, OfferAccount } from "@utils/spl/types";

interface UseSingleOfferInterface {
  offer?: OfferAccount;
  nftData?: Metadata;
  subOffers: SubOfferAccount[];
  isLoading: boolean;
  error?: unknown;
}

export const useSingleOffer = (offerKey: PublicKey | null): UseSingleOfferInterface => {
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(true);
  const [offer, setOffer] = useState<OfferAccount | undefined>(undefined);
  const [subOffers, setSubOffers] = useState<SubOfferAccount[]>([]);
  const [nftData, setNftData] = useState<Metadata | undefined>(undefined);
  const [error, setError] = useState<unknown>();

  const run = useCallback(async (): Promise<void> => {
    try {
      if (offerKey == null) throw Error("Invalid offer address");

      const offerInfo = await Offer.fromAccountAddress(connection, offerKey);
      const metadataPda = findMetadataPda(offerInfo.nftMint);
      const metadata = await Metadata.fromAccountAddress(connection, metadataPda);

      const { startSubOfferNum, subOfferCount } = offerInfo;
      const subOfferRange = range(
        new BN(startSubOfferNum).toNumber(),
        new BN(subOfferCount).toNumber(),
      );

      const subOfferAddresses = subOfferRange.map(
        (num) =>
          PublicKey.findProgramAddressSync(
            [SUB_OFFER_TAG, offerKey.toBuffer(), new BN(num).toArrayLike(Buffer, "be", 8)],
            NFT_LOAN_PID,
          )[0],
      );

      const subOfferAccounts = (
        await GmaBuilder.make(connection, subOfferAddresses).getAndMap((account) => {
          if (!account.exists) return null;
          return { pubkey: account.publicKey, account: SubOffer.deserialize(account.data)[0] };
        })
      ).filter((item): item is SubOfferAccount => item !== null);

      setOffer({ pubkey: offerKey, account: offerInfo });
      setNftData(metadata);
      setSubOffers(subOfferAccounts);
    } catch (err: unknown) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [connection, offerKey]);

  useEffect(() => {
    void run();
  }, [run]);

  return { offer, nftData, subOffers, isLoading, error };
};
