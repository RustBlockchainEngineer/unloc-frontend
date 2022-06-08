import { IDynamicKeyStringPair } from "@constants/most-used-structures";

export const localesHome = {
  pageTitle: "UNLOC the full potential of your NFTs!",
};

export const localesTop = {
  home: "Home",
  myOffers: "My Offers",
  loansGiven: "Loans Given",
  myProfile: "My Profile",
};

export const localesFooterCommunity: IDynamicKeyStringPair = {
  discord: "https://discord.gg/UnlocNFT",
  telegram: "https://t.me/UnlocNFT",
  twitter: "https://twitter.com/UnlocNFT",
  medium: "https://unlocnft.medium.com/",
};

//TODO: What was initial idea of constants below? 'cause seems like there are newer used
const termsAndConditions = "terms & conditions";
const privacyPolicy = "privacy policy";
const aboutUs = "about us";

export const localesFooterLegal: IDynamicKeyStringPair = {
  whitepaper: "",
  roadmap: "",
  [termsAndConditions]: "",
  [privacyPolicy]: "",
};

export const localesFooterCompany: IDynamicKeyStringPair = {
  careers: "",
  [aboutUs]: "",
};
