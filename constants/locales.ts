import { DynamicKeyStringPair } from "@constants/most-used-structures";

export const localesHome = {
  pageTitle: "UNLOC the full potential of your NFTs!",
};

export const localesTop = {
  home: "Home",
  myOffers: "My Offers",
  Profile: "Profile",
  Vote: "Voting",
};

export const localesFooterCommunity: DynamicKeyStringPair = {
  discord: "https://discord.gg/UnlocNFT",
  telegram: "https://t.me/UnlocNFT",
  twitter: "https://twitter.com/UnlocNFT",
  medium: "https://unlocnft.medium.com/",
};

// TODO: What was initial idea of constants below? 'cause seems like there are newer used
const termsAndConditions = "terms & conditions";
const privacyPolicy = "privacy policy";
const aboutUs = "about us";

export const localesFooterLegal: DynamicKeyStringPair = {
  whitepaper: "",
  roadmap: "",
  [termsAndConditions]: "",
  [privacyPolicy]: "",
};

export const localesFooterCompany: DynamicKeyStringPair = {
  careers: "",
  [aboutUs]: "",
};
