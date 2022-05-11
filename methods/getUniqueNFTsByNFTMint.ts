export const getUniqueNFTsByNFTMint = (items: any) => {
  return [...new Map(items.map((item: any) => [item.account.nftMint.toBase58(), item])).values()];
};
