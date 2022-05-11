import * as anchor from "@project-serum/anchor";
import { programId, program, SubOfferState } from "./nftLoan";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

export const getSubOffersKeysByState = async (state: SubOfferState[]) => {
  try {
    const accountName = "subOffer";
    const discriminator = anchor.AccountsCoder.accountDiscriminator(accountName);
    const data = await program.provider.connection.getProgramAccounts(programId, {
      dataSlice: { offset: 0, length: 0 }, // Fetch without any data.
      filters: [
        { memcmp: { offset: 0, bytes: bs58.encode(discriminator) } },
        { memcmp: { offset: discriminator.length + 96, bytes: bs58.encode(state) } }, // add filters for nftMint, APR, Duration, Amount and this function will be glorious
      ],
    });

    return data.map((offer) => offer.pubkey);
  } catch (e) {
    console.log(e);
  }
};
