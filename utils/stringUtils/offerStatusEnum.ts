export const setOfferStatus = (status: string) => {
  switch (status) {
    case "0":
      return "PROPOSAL";
    case "1":
      return "ACTIVE";
  }
};
