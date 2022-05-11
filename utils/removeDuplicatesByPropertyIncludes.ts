export const removeDuplicatesByPropertyIncludes = (data: string | any[], objKey: string) => {
  const output: any[] = [];

  for (let i = 0; i < data.length; i++) {
    const nftMint = data[i][objKey];
    if (!output.includes(nftMint)) {
      output.push(nftMint);
    }
  }

  return output;
};
