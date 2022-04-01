import * as anchor from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { IDL as idl, UnlocNftLoan } from '../integration/unloc_nft_loan'
import { NFT_LOAN_PID, RPC_ENDPOINT } from '../constants/config'
import { Connection, Keypair, MemcmpFilter, PublicKey } from '@solana/web3.js'
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { Edition, MasterEdition, Metadata, MetadataData, MetadataKey } from '@metaplex-foundation/mpl-token-metadata'
import axios from 'axios'
import { ArweaveMetadata, IMasterEdition, IMetadata, OnChainMetadata } from '../@types/IOfferData'

const SOLANA_CONNECTION = new Connection(RPC_ENDPOINT, {
  disableRetryOnRateLimit: true
})

let program: anchor.Program<UnlocNftLoan> = null as unknown as anchor.Program<UnlocNftLoan>
let programId: anchor.web3.PublicKey = null as unknown as anchor.web3.PublicKey

const systemProgram = anchor.web3.SystemProgram.programId
const tokenProgram = TOKEN_PROGRAM_ID
const rent = anchor.web3.SYSVAR_RENT_PUBKEY
const clock = anchor.web3.SYSVAR_CLOCK_PUBKEY
const defaults = {
  systemProgram,
  tokenProgram,
  rent,
  clock
}

const GLOBAL_STATE_TAG = Buffer.from('global-state-seed')
const OFFER_TAG = Buffer.from('offer-seed')
const SUB_OFFER_TAG = Buffer.from('sub-offer-seed')
const NFT_VAULT_TAG = Buffer.from('nft-vault-seed')
const OFFER_VAULT_TAG = Buffer.from('offer-vault-seed')
const TREASURY_VAULT_TAG = Buffer.from('treasury-vault-seed')

// This command makes an Lottery
export const initLoanProgram = (
  connection: anchor.web3.Connection,
  wallet: any,
  pid: anchor.web3.PublicKey = NFT_LOAN_PID
) => {
  if (program != null) {
    return
  }
  programId = pid
  // const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions())
  const provider = new anchor.Provider(connection, wallet, { skipPreflight: true })

  // Generate the program client from IDL.
  program = new (anchor as any).Program(idl, programId, provider) as anchor.Program<UnlocNftLoan>
}
// initLoanProgram(SOLANA_CONNECTION, Keypair.generate())

export const getGlobalState = async () => {
  const globalState = await pda([GLOBAL_STATE_TAG], programId)
  return await program.account.globalState.fetchNullable(globalState)
}

export const getOfferList = async () => {
  return await program.account.offer.all()
}

export const getOfferMultiple = async (keys: anchor.web3.PublicKey[]) => {
  return await program.account.offer.fetchMultiple(keys)
}

export const getOffer = async (key: anchor.web3.PublicKey) => {
  return await program.account.offer.fetchNullable(key)
}

export const getOffersBy = async (
  owner?: anchor.web3.PublicKey,
  nftMint?: anchor.web3.PublicKey,
  state?: OfferState
) => {
  const accountName = 'offer'
  const discriminator = anchor.AccountsCoder.accountDiscriminator(accountName)
  const filters: any[] = []

  if (owner) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length,
        bytes: owner.toBase58()
      }
    }
    filters.push(filter)
  }
  if (nftMint) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 32,
        bytes: nftMint.toBase58()
      }
    }
    filters.push(filter)
  }
  if (state) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 96,
        bytes: bs58.encode([state])
      }
    }
    filters.push(filter)
  }

  return await program.account.offer.all(filters)
}

export const getSubOffer = async (key: anchor.web3.PublicKey) => {
  return await program.account.subOffer.fetchNullable(key)
}

export const getSubOfferList = async (
  offer?: anchor.web3.PublicKey,
  nftMint?: anchor.web3.PublicKey,
  state?: SubOfferState
) => {
  const accountName = 'subOffer'
  const discriminator = anchor.AccountsCoder.accountDiscriminator(accountName)
  const filters: any[] = []
  if (offer) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 97,
        bytes: offer.toBase58()
      }
    }
    filters.push(filter)
  }
  if (nftMint) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 32,
        bytes: nftMint.toBase58()
      }
    }
    filters.push(filter)
  }
  if (state) {
    const filter: MemcmpFilter = {
      memcmp: {
        offset: discriminator.length + 96,
        bytes: bs58.encode([state])
      }
    }
    filters.push(filter)
  }

  return await program.account.subOffer.all(filters)
}

export const getAllSubOffers = async () => {
  return await program.account.subOffer.all()
}

export const getSubOfferMultiple = async (keys: anchor.web3.PublicKey[]) => {
  return await program.account.subOffer.fetchMultiple(keys)
}

export const setGlobalState = async (
  accruedInterestNumerator: anchor.BN,
  denominator: anchor.BN,
  aprNumerator: anchor.BN,
  expireDurationForLenader: anchor.BN,
  treasury: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const globalState = await pda([GLOBAL_STATE_TAG], programId)
  const superOwner = signer

  const tx = await program.rpc.setGlobalState(
    accruedInterestNumerator,
    denominator,
    aprNumerator,
    expireDurationForLenader,
    {
      accounts: {
        superOwner,
        globalState,
        newSuperOwner: superOwner,
        treasuryWallet: treasury,
        ...defaults
      },
      signers
    }
  )

  // eslint-disable-next-line no-console
  console.log('setGlobalState tx = ', tx)
}

export const setOffer = async (
  nftMint: anchor.web3.PublicKey,

  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const borrowerNftVault: anchor.web3.PublicKey = await checkWalletATA(nftMint.toBase58())

  const borrower = signer
  const offer = await pda([OFFER_TAG, borrower.toBuffer(), nftMint.toBuffer()], programId)
  const nftVault = await pda([NFT_VAULT_TAG, offer.toBuffer()], programId)
  const tx = await program.rpc.setOffer({
    accounts: {
      borrower,
      offer,
      nftMint,
      nftVault,
      userVault: borrowerNftVault,
      ...defaults
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('setOffer tx = ', tx)
}

export const cancelOffer = async (
  nftMint: anchor.web3.PublicKey,
  borrowerNftVault: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const borrower = signer
  const offer = await pda([OFFER_TAG, borrower.toBuffer(), nftMint.toBuffer()], programId)
  const nftVault = await pda([NFT_VAULT_TAG, offer.toBuffer()], programId)
  const tx = await program.rpc.cancelOffer({
    accounts: {
      borrower,
      offer,
      nftVault,
      userVault: borrowerNftVault,
      ...defaults
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('cancelOffer tx = ', tx)
}

export const createSubOffer = async (
  offerAmount: anchor.BN,
  loanDuration: anchor.BN,
  minRepaidNumerator: anchor.BN,
  aprNumerator: anchor.BN,
  nftMint: anchor.web3.PublicKey,
  offerMint: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const globalState = await pda([GLOBAL_STATE_TAG], programId)
  const borrower = signer
  const offer = await pda([OFFER_TAG, borrower.toBuffer(), nftMint.toBuffer()], programId)
  const offerData = await program.account.offer.fetch(offer)
  const subOfferNumer = offerData.subOfferCount
  const subOffer = await pda([SUB_OFFER_TAG, offer.toBuffer(), subOfferNumer.toArrayLike(Buffer, 'be', 8)], programId)
  const treasuryVault = await pda([TREASURY_VAULT_TAG, offerMint.toBuffer()], programId)
  const globalStateData = await program.account.globalState.fetch(globalState)

  const treasuryWallet = globalStateData.treasuryWallet
  const tx = await program.rpc.setSubOffer(offerAmount, subOfferNumer, loanDuration, minRepaidNumerator, aprNumerator, {
    accounts: {
      borrower,
      globalState,
      offer,
      subOffer,
      offerMint,
      treasuryWallet,
      treasuryVault,
      ...defaults
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('createSubOffer tx = ', tx)
  return tx
}

export const updateSubOffer = async (
  offerAmount: anchor.BN,
  loanDuration: anchor.BN,
  minRepaidNumerator: anchor.BN,
  aprNumerator: anchor.BN,

  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const globalState = await pda([GLOBAL_STATE_TAG], programId)
  const borrower = signer
  const subOfferData = await program.account.subOffer.fetch(subOffer)
  const offer = await pda([OFFER_TAG, borrower.toBuffer(), subOfferData.nftMint.toBuffer()], programId)
  const subOfferNumer = subOfferData.subOfferNumber
  const offerMint = subOfferData.offerMint
  const treasuryVault = await pda([TREASURY_VAULT_TAG, subOfferData.offerMint.toBuffer()], programId)
  const globalStateData = await program.account.globalState.fetch(globalState)

  const treasuryWallet = globalStateData.treasuryWallet
  const tx = await program.rpc.setSubOffer(offerAmount, subOfferNumer, loanDuration, minRepaidNumerator, aprNumerator, {
    accounts: {
      borrower,
      globalState,
      offer,
      subOffer,
      offerMint,
      treasuryWallet,
      treasuryVault,
      ...defaults
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('updateSubOffer tx = ', tx)
  return tx
}

export const cancelSubOffer = async (
  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const borrower = signer
  const subOfferData = await program.account.subOffer.fetch(subOffer)
  const offer = await pda([OFFER_TAG, borrower.toBuffer(), subOfferData.nftMint.toBuffer()], programId)
  const tx = await program.rpc.cancelSubOffer({
    accounts: {
      borrower,
      offer,
      subOffer
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('cancelSubOffer tx = ', tx)
  return tx
}

export const acceptOffer = async (
  subOffer: anchor.web3.PublicKey,
  userVault: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const lender = signer
  const subOfferData = await program.account.subOffer.fetch(subOffer)
  const offer = subOfferData.offer
  const offerMint = subOfferData.offerMint
  const offerVault = await pda([OFFER_VAULT_TAG, subOffer.toBuffer()], programId)
  const offerData = await program.account.offer.fetch(subOfferData.offer)
  const borrower = offerData.borrower

  const tx = await program.rpc.acceptOffer({
    accounts: {
      lender,
      borrower,
      offer,
      subOffer,
      offerMint,
      offerVault,
      userVault,
      ...defaults
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('acceptOffer tx = ', tx)
}

export const claimLoan = async (
  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const borrower = signer
  const subOfferData = await program.account.subOffer.fetch(subOffer)
  const offer = subOfferData.offer
  const offerVault = await pda([OFFER_VAULT_TAG, subOffer.toBuffer()], programId)
  const userVault: anchor.web3.PublicKey = await checkWalletATA(subOfferData.offerMint.toBase58())

  const tx = await program.rpc.claimLoan({
    accounts: {
      borrower,
      offer,
      subOffer,
      offerVault,
      userVault,
      tokenProgram
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('claimLoan tx = ', tx)
}

export const repayLoan = async (
  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const globalState = await pda([GLOBAL_STATE_TAG], programId)
  const borrower = signer
  const subOfferData = await program.account.subOffer.fetch(subOffer)
  const offer = subOfferData.offer
  const offerVault = await pda([OFFER_VAULT_TAG, subOffer.toBuffer()], programId)
  const userVault: anchor.web3.PublicKey = await checkWalletATA(subOfferData.offerMint.toBase58())
  const tx = await program.rpc.repayLoan({
    accounts: {
      borrower,
      globalState,
      offer,
      subOffer,
      offerVault,
      userVault,
      tokenProgram,
      clock
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('repayLoan tx = ', tx)
}

export const claimLoanPayment = async (
  subOffer: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const subOfferData = await program.account.subOffer.fetch(subOffer)
  const globalState = await pda([GLOBAL_STATE_TAG], programId)
  const lender = signer
  const offer = subOfferData.offer
  const offerData = await program.account.offer.fetch(offer)
  const offerVault = await pda([OFFER_VAULT_TAG, subOffer.toBuffer()], programId)
  const offerMint = subOfferData?.offerMint
  const treasuryVault = await pda([TREASURY_VAULT_TAG, offerMint.toBuffer()], programId)
  const userVault: anchor.web3.PublicKey = await checkWalletATA(subOfferData.offerMint.toBase58())

  const tx = await program.rpc.claimLoanPayment({
    accounts: {
      lender,
      borrower: offerData.borrower,
      globalState,
      offer,
      subOffer,
      offerVault,
      userVault,
      treasuryVault,
      tokenProgram
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('claimLoanPayment tx = ', tx)
}

export const claimCollateral = async (
  subOffer: anchor.web3.PublicKey,
  userVault: anchor.web3.PublicKey,
  signer: anchor.web3.PublicKey = program.provider.wallet.publicKey,
  signers: anchor.web3.Keypair[] = []
) => {
  const borrower = signer
  const subOfferData = await program.account.subOffer.fetch(subOffer)
  const offer = subOfferData.offer
  const nftVault = await pda([NFT_VAULT_TAG, offer.toBuffer()], programId)

  const tx = await program.rpc.claimCollateral({
    accounts: {
      borrower,
      offer,
      subOffer,
      nftVault,
      userVault,
      tokenProgram
    },
    signers
  })

  // eslint-disable-next-line no-console
  console.log('claimCollateral tx = ', tx)
}

export async function pda(seeds: (Buffer | Uint8Array)[], pid: anchor.web3.PublicKey) {
  const [pdaKey] = await anchor.web3.PublicKey.findProgramAddress(seeds, pid)
  return pdaKey
}

export enum OfferState {
  Proposed,
  Accepted,
  Expired,
  Fulfilled,
  NFTClaimed,
  Canceled
}

export enum SubOfferState {
  Proposed,
  Accepted,
  Expired,
  Fulfilled,
  LoanPaymentClaimed,
  Canceled
}

export const checkWalletATA = async (
  mint: string,
  connection: anchor.web3.Connection = program.provider.connection,
  walletPubkey: anchor.web3.PublicKey = program.provider.wallet.publicKey
) => {
  const parsedTokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletPubkey,
    {
      programId: TOKEN_PROGRAM_ID
    },
    'confirmed'
  )
  let result: any = null
  parsedTokenAccounts.value.forEach(async (tokenAccountInfo) => {
    const tokenAccountPubkey = tokenAccountInfo.pubkey
    const parsedInfo = tokenAccountInfo.account.data.parsed.info
    const mintAddress = parsedInfo.mint
    if (mintAddress === mint) {
      result = tokenAccountPubkey
    }
  })
  return result
}

export const logObject = (title: string, obj: any) => {
  // eslint-disable-next-line no-console
  console.log(title, obj)
}
export const getOfferBalance = async (
  subOffer: anchor.web3.PublicKey,
  connection: anchor.web3.Connection = program.provider.connection,
  walletPubkey: anchor.web3.PublicKey = program.provider.wallet.publicKey
) => {
  try {
    const tokenAccount = await pda([OFFER_VAULT_TAG, subOffer.toBuffer()], programId)
    const balance = (await connection.getTokenAccountBalance(tokenAccount)).value.uiAmount as number
    return balance
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
  return 0
}
// --------------------utilities---------------------

export class MultipleNFT {
  public mints: anchor.web3.PublicKey[]
  public metadatas: NFTMetadata[] = []
  constructor(keys: anchor.web3.PublicKey[]) {
    this.mints = keys
  }
  public async initialize() {
    if (this.metadatas.length == 0) {
      const metadataPDAs: PublicKey[] = []
      for (let i = 0; i < this.mints.length; i++) {
        const metadataPDA = await Metadata.getPDA(this.mints[i])
        metadataPDAs.push(metadataPDA)
      }
      let i = 0
      const metaInfos = await Metadata.getInfos(program.provider.connection, metadataPDAs)
      metaInfos.forEach((value: anchor.web3.AccountInfo<Buffer>, key: any, map: any) => {
        const metadata = MetadataData.deserialize(value.data)
        const nftMetadata = new NFTMetadata(this.mints[i], metadataPDAs[i], metadata)
        this.metadatas.push(nftMetadata)
        i++
      })
    }
  }
  public getNftMeta(mint: PublicKey) {
    for (let i = 0; i < this.metadatas.length; i++) {
      if (this.metadatas[i].mint === mint.toBase58()) {
        return this.metadatas[i]
      }
    }
    return null
  }
  public async initArweavedata() {
    for (let i = 0; i < this.metadatas.length; i++) {
      await this.metadatas[i].getAreaveMetadata()
    }
  }
}

export class NFTMetadata implements IMetadata {
  mint = ''
  metadataPDA = ''
  onChainMetadata: OnChainMetadata = null as any
  arweaveMetadata: ArweaveMetadata = null as any
  masterEdition: IMasterEdition = null as any
  constructor(mint: anchor.web3.PublicKey, metadataPDA: anchor.web3.PublicKey, onChainMetadata: OnChainMetadata) {
    this.mint = mint.toBase58()
    this.metadataPDA = metadataPDA.toBase58()
    this.onChainMetadata = onChainMetadata
  }

  public async getAreaveMetadata() {
    if (this.arweaveMetadata === null) {
      try {
        const arweaveData = await axios.get(this.onChainMetadata.data.uri)
        if (arweaveData) {
          this.arweaveMetadata = arweaveData.data
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    }
    return this.arweaveMetadata
  }
  public currentAreaveMetadata() {
    return this.arweaveMetadata
  }
  public async getMasterEdition() {
    if (this.arweaveMetadata === null) {
      const masterEditionPDA = await Edition.getPDA(new PublicKey(this.mint))
      const editionAccountInfo = await program.provider.connection.getAccountInfo(masterEditionPDA)

      if (editionAccountInfo) {
        const key = editionAccountInfo?.data[0]
        let masterEditionData
        let data

        switch (key) {
          case MetadataKey.MasterEditionV1:
          case MetadataKey.MasterEditionV2:
            ;({ data } = new MasterEdition(masterEditionPDA, editionAccountInfo))
            masterEditionData = data
            break
          default:
            masterEditionData = undefined
            break
        }

        this.masterEdition = {
          masterEditionPDA: masterEditionPDA.toString(),
          masterEditionData
        }
      }
    }
    return this.masterEdition
  }
}
