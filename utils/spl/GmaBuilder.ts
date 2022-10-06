// Builder for a getMultipleAccounts query, similar to GpaBuilder
import { Commitment, PublicKey, Connection } from "@solana/web3.js";
import { UnparsedMaybeAccount } from "@utils/spl/types";
import { chunk } from "@utils/common";
import { getMultipleAccounts } from "./getMultipleAccounts";

export type GmaBuilderOptions = {
  chunkSize?: number;

  /** The level of commitment desired when querying the blockchain. */
  commitment?: Commitment;
};

export class GmaBuilder {
  protected readonly connection: Connection;
  protected readonly publicKeys: PublicKey[];
  protected readonly commitment?: Commitment;
  protected chunkSize: number;

  constructor(connection: Connection, publicKeys: PublicKey[], options: GmaBuilderOptions = {}) {
    this.connection = connection;
    this.chunkSize = options.chunkSize ?? 100;
    this.commitment = options.commitment;
    this.publicKeys = publicKeys;
  }

  static make(connection: Connection, publicKeys: PublicKey[], options: GmaBuilderOptions = {}) {
    return new GmaBuilder(connection, publicKeys, options);
  }

  chunkBy(n: number) {
    this.chunkSize = n;

    return this;
  }

  addPublicKeys(publicKeys: PublicKey[]) {
    this.publicKeys.push(...publicKeys);

    return this;
  }

  getPublicKeys(): PublicKey[] {
    return this.publicKeys;
  }

  getUniquePublicKeys(): PublicKey[] {
    // TODO: Only send unique keys and reconciliate after call.
    return this.getPublicKeys();
  }

  async getFirst(n?: number): Promise<UnparsedMaybeAccount[]> {
    const end = this.boundNumber(n ?? 1);

    return this.getChunks(this.getPublicKeys().slice(0, end));
  }

  async getLast(n?: number): Promise<UnparsedMaybeAccount[]> {
    const start = this.boundNumber(n ?? 1);

    return this.getChunks(this.getPublicKeys().slice(-start));
  }

  async getBetween(start: number, end: number): Promise<UnparsedMaybeAccount[]> {
    start = this.boundNumber(start);
    end = this.boundNumber(end);
    [start, end] = start > end ? [end, start] : [start, end];

    return this.getChunks(this.getPublicKeys().slice(start, end));
  }

  async getPage(page: number, perPage: number): Promise<UnparsedMaybeAccount[]> {
    return this.getBetween((page - 1) * perPage, page * perPage);
  }

  async get(): Promise<UnparsedMaybeAccount[]> {
    return this.getChunks(this.getPublicKeys());
  }

  async getAndMap<T>(callback: (account: UnparsedMaybeAccount) => T): Promise<T[]> {
    return (await this.get()).map(callback);
  }

  protected async getChunks(publicKeys: PublicKey[]): Promise<UnparsedMaybeAccount[]> {
    const chunks = chunk(publicKeys, this.chunkSize);
    const chunkPromises = chunks.map((chunk) => this.getChunk(chunk));
    const resolvedChunks = await Promise.all(chunkPromises);

    return resolvedChunks.flat();
  }

  protected async getChunk(publicKeys: PublicKey[]): Promise<UnparsedMaybeAccount[]> {
    try {
      return await getMultipleAccounts(this.connection, publicKeys, this.commitment);
    } catch (error) {
      // Todo: custom error?
      throw error;
    }
  }

  protected boundNumber(n: number): number {
    return this.boundIndex(n - 1) + 1;
  }

  protected boundIndex(index: number): number {
    index = index < 0 ? 0 : index;
    index = index >= this.publicKeys.length ? this.publicKeys.length - 1 : index;

    return index;
  }
}
