import * as web3 from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ADDRESS as MetaplexPid } from "@metaplex-foundation/mpl-token-metadata";

export async function withFindOrInitAssociatedTokenAccount(
  transaction: web3.Transaction,
  connection: web3.Connection,
  mint: web3.PublicKey,
  owner: web3.PublicKey,
  payer: web3.PublicKey,
  allowOwnerOffCurve?: boolean,
): Promise<web3.PublicKey> {
  const associatedAddress = await splToken.getAssociatedTokenAddress(
    mint,
    owner,
    allowOwnerOffCurve,
    splToken.TOKEN_PROGRAM_ID,
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const account = await connection.getAccountInfo(associatedAddress);
  if (!account) {
    transaction.add(
      splToken.createAssociatedTokenAccountInstruction(
        payer,
        associatedAddress,
        owner,
        mint,
        splToken.TOKEN_PROGRAM_ID,
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }
  return associatedAddress;
}

/**
 * Pay and create mint and token account
 * @param connection
 * @param creator
 * @returns
 */
export const createMintTransaction = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: WalletContextState,
  recipient: web3.PublicKey,
  mintId: web3.PublicKey,
  amount = 1,
  freezeAuthority: web3.PublicKey = recipient,
): Promise<[web3.PublicKey, web3.Transaction]> => {
  const mintBalanceNeeded = await splToken.getMinimumBalanceForRentExemptMint(connection);
  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: wallet.publicKey!,
      newAccountPubkey: mintId,
      lamports: mintBalanceNeeded,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      space: splToken.MintLayout.span,
      programId: splToken.TOKEN_PROGRAM_ID,
    }),
  );
  transaction.add(
    splToken.createInitializeMintInstruction(mintId, 0, wallet.publicKey!, freezeAuthority),
  );
  const walletAta = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    mintId,
    wallet.publicKey!,
    wallet.publicKey!,
  );
  if (amount > 0) {
    transaction.add(splToken.createMintToInstruction(mintId, walletAta, wallet.publicKey!, amount));
  }
  return [walletAta, transaction];
};

export const META_PREFIX = "metadata";
export const EDITION_PREFIX = "edition";

export const findEditionPda = async (nft_mint: PublicKey) => {
  return PublicKey.findProgramAddress(
    [
      Buffer.from(META_PREFIX),
      new PublicKey(MetaplexPid).toBuffer(),
      nft_mint.toBuffer(),
      Buffer.from(EDITION_PREFIX),
    ],
    new PublicKey(MetaplexPid),
  );
};
export const findNftMetadata = async (nft_mint: PublicKey) => {
  return PublicKey.findProgramAddress(
    [Buffer.from(META_PREFIX), new PublicKey(MetaplexPid).toBuffer(), nft_mint.toBuffer()],
    new PublicKey(MetaplexPid),
  );
};
