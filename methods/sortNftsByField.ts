import { ArweaveMetadata } from '../@types/IOfferData'

const sortNftsByField = (nfts: any[], field: keyof ArweaveMetadata): any[] => {
  return nfts.sort((a: any, b: any) => {
    if (!(a && a.nftMeta && a.nftMeta.arweaveMetadata && b && b.nftMeta && b.nftMeta.arweaveMetadata)) return 0

    const aField = a.nftMeta.arweaveMetadata[field]
    const bField = b.nftMeta.arweaveMetadata[field]

    if (!(aField && bField)) return 0

    return aField < bField ? -1 : +(aField > bField)
  })
}

export default sortNftsByField
