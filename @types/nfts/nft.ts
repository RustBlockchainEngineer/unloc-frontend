import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface INftCoreData {
  tokenAccount?: PublicKey;
  collection: string;
  mint: string;
  image: string;
  name: string;
  external_url: string;
}

export interface IMasterEdition {
  masterEditionPDA: string;
  masterEditionData?: IMasterEditionData;
}

export interface IMasterEditionData {
  key: number;
  supply: BN;
  maxSupply?: BN;
}

export interface IMetadata {
  metadataPDA: string;
  onChainMetadata: IOnChainMetadata;
  arweaveMetadata: IArweaveMetadata;
}

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

export interface IOnChainMetadata {
  key: number;
  updateAuthority: string;
  mint: string;
  data: IData;
  primarySaleHappened: boolean;
  isMutable: boolean;
}

export interface IData {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: ICreator[] | null;
}

export interface ICreator {
  address: string;
  verified: boolean;
  share: number;
}
