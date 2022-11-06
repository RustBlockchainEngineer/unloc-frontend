// eslint-disable-next-line import/named
import { bignum } from "@metaplex-foundation/beet";
import { PROGRAM_ID as TOKEN_META_PID } from "@metaplex-foundation/mpl-token-metadata";
import {
  AccountLayout,
  createInitializeAccountInstruction,
  getMinimumBalanceForRentExemptAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
// eslint-disable-next-line import/named
import { BN } from "bn.js";

export const amountToUiAmount = (amount: BigInt | bignum, mintDecimals: number) => {
  amount = typeof amount === "bigint" ? amount : BigInt(amount.toString());
  const decimals = BigInt(10 ** mintDecimals);
  const fractional = Number(amount.valueOf() % decimals) / Number(decimals);
  return Number(amount.valueOf() / decimals) + fractional;
};

export const uiAmountToAmount = (amount: number | string, mintDecimals: number) => {
  amount = typeof amount === "number" ? amount.toString() : amount;

  if (amount === "0") return new BN(0);

  // Check if it doesn't have any decimal numbers
  const tokens = amount.split(".");
  if (tokens.length === 1) return new BN(amount).mul(new BN(10 ** mintDecimals));

  const fraction = tokens[1];
  if (fraction.length > mintDecimals) throw Error("Invalid uiAmount conversion, too many decimals");

  // The smaller the multiplication we need to do with regular numbers the better,
  // switching to BN or BigInt ASAP is preferred so there's less chance of overflow errors
  const converted = Number(amount) * 10 ** fraction.length;
  return new BN(converted).muln(10 ** (mintDecimals - fraction.length));
};

export const getWalletTokenAccount = async (
  connection: Connection,
  walletPubkey: PublicKey,
  mint: PublicKey,
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
    if (mintAddress === mint.toBase58() && amount >= maxAmount) {
      result = tokenAccountPubkey;
      maxAmount = amount;
    }
  });

  return result;
};

export function isPublicKey(value: any) {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export const addTokenAccountInstruction = async (
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  instructions: TransactionInstruction[],
  signer: PublicKey,
  signers: Keypair[],
  rent: number = 0,
) => {
  const newKeypair = Keypair.generate();
  const rentForTokenAccount = await getMinimumBalanceForRentExemptAccount(connection);
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: signer,
      newAccountPubkey: newKeypair.publicKey,
      lamports: rent > 0 ? rent : rentForTokenAccount,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );
  const instruction = createInitializeAccountInstruction(
    newKeypair.publicKey,
    mint,
    owner,
    TOKEN_PROGRAM_ID,
  );
  instructions.push(instruction);
  signers.push(newKeypair);
  return newKeypair.publicKey;
};

export const getEditionKey = (nftMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_META_PID.toBuffer(),
      nftMint.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_META_PID,
  )[0];
};
export const getNftMetadataKey = (nftMint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_META_PID.toBuffer(), nftMint.toBuffer()],
    TOKEN_META_PID,
  )[0];
};
