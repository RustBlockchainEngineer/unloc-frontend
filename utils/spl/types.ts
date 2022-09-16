import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { Offer, SubOffer } from "@unloc-dev/unloc-loan-solita";

// AccountInfo with publicKey
export type Account<T> = {
  readonly publicKey: PublicKey;
  readonly executable: boolean;
  readonly owner: PublicKey;
  readonly lamports: number;
  readonly data: T;
  readonly rentEpoch?: number;
};

export type MaybeAccount<T> =
  | (Account<T> & { readonly exists: true })
  | { readonly publicKey: PublicKey; readonly exists: false };

export type UnparsedAccount = Account<Buffer>;
export type UnparsedMaybeAccount = MaybeAccount<Buffer>;

export function getUnparsedMaybeAccount(
  publicKey: PublicKey,
  accountInfo: AccountInfo<Buffer> | null,
): UnparsedMaybeAccount {
  if (!accountInfo) {
    return { publicKey, exists: false };
  }

  return { publicKey, exists: true, ...accountInfo };
}

export interface OfferAccount {
  pubkey: PublicKey;
  account: Offer;
}

export interface SubOfferAccount {
  pubkey: PublicKey;
  account: SubOffer;
}
export interface SanitizedData {
  collateralId: string;
  metadata: Metadata;
}

export interface PreparedOfferData {
  nftMint: string;
  amount: number;
  duration: number;
  APR: number;
  currency: string;
  repayValue: string;
}

// NFT Off-chain metadata types
export interface IArweaveMetadata {
  image: string;
  name: string;
  symbol: string;
  collection: ICollectionClass | string;
  attributes?: IAttribute[];
  seller_fee_basis_points: number;
  properties: IProperties;
  description?: string;
  uri?: string;
  external_url?: string;
  update_authority?: string;
  primary_sale_happened?: boolean;
  is_mutable?: boolean;
}

export interface IAttribute {
  trait_type: string;
  value: number | string;
  display_type?: string;
}

export interface ICollectionClass {
  name: string;
  family: string;
}

export interface IProperties {
  creators?: IPropertiesCreator[];
  files: IFile[];
  category?: string;
}

export interface IPropertiesCreator {
  address: string;
  share: number;
  verified?: boolean | number;
}

export interface IFile {
  uri: string;
  type: string;
}
