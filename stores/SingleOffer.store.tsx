import { action, makeAutoObservable, flow } from "mobx";
import axios from "axios";
import * as anchor from "@project-serum/anchor";
import { getOffer, getSubOffersInRange } from "@integration/nftLoan";
import { INftCoreData } from "../@types/nfts/nft";
import { getMetadata } from "@integration/nftIntegration";
import { getDecimalsForLoanAmount } from "@integration/getDecimalForLoanAmount";
import { calculateRepayValue } from "@utils/calculateRepayValue";
import { currencyMints } from "@constants/currency";
import { toast } from "react-toastify";
import { getDurationFromContractData } from "@utils/timeUtils/timeUtils";
import { OfferAccount, Offer } from "../@types/loans";
import { range } from "@utils/range";

interface LoanInterface {
  id: string;
  status: number;
  amount: string;
  currency: string;
  duration: string;
  apr: number;
  offerMint: string;
  publicKey: anchor.web3.PublicKey;
  totalRepay: string;
}

export class SingleOfferStore {
  rootStore;
  offer = {} as OfferAccount;
  nftData = {} as INftCoreData;
  loansData: LoanInterface[] = [];
  isYours: boolean = false;
  loansCount = 0;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action.bound fetchOffer = flow(function* (
    this: SingleOfferStore,
    id: string,
    walletAddress?: string,
  ) {
    const pubkey = new anchor.web3.PublicKey(id);
    const offer: Offer = yield getOffer(pubkey);
    this.offer = { publicKey: pubkey, account: offer };
    this.isYours = offer.borrower.toString() === walletAddress;

    const metadata = yield getMetadata(offer.nftMint);
    const collection = yield axios.post("/api/collections/nft", { id: offer.nftMint.toString() });
    if (collection && metadata && metadata.arweaveMetadata) {
      this.nftData = {
        ...metadata.arweaveMetadata,
        collection: collection.data,
        mint: offer.nftMint.toString(),
      };
    }
  });

  @action.bound fetchSubOffers = async (): Promise<void> => {
    if (!this.offer) return;

    // We need to find the suboffer PDAs
    const { startSubOfferNum, subOfferCount } = this.offer.account;
    const subOfferRange = range(startSubOfferNum.toNumber(), subOfferCount.toNumber());

    try {
      const subOffers = await getSubOffersInRange(this.offer.publicKey, subOfferRange);
      const loansArr: Array<LoanInterface> = [];
      subOffers.forEach((element) => {
        const { publicKey, account } = element;
        const { offerAmount, offerMint, loanDuration, aprNumerator, state } = account;

        const amountConvered = getDecimalsForLoanAmount(
          offerAmount.toNumber(),
          offerMint.toBase58(),
        );

        // Converting the duration to days if it's more than 0, otherwise just use 0
        const durationConverted = loanDuration.gtn(0)
          ? getDurationFromContractData(loanDuration.toNumber(), "days")
          : 0;
        const aprConverted = aprNumerator.toNumber();

        loansArr.push({
          id: publicKey.toBase58(),
          status: state,
          amount: amountConvered.toString(),
          currency: currencyMints[offerMint.toBase58()],
          duration: durationConverted.toString(), // suspecting wrong type here, also we are showing loans with 0 day duration this is wrong
          apr: aprConverted,
          offerMint: offerMint.toBase58(),
          publicKey: publicKey,
          totalRepay: calculateRepayValue(
            Number(amountConvered),
            aprConverted,
            durationConverted,
            this.rootStore.GlobalState.denominator,
          ),
        });
      });

      this.loansCount = subOffers.filter((s) => s.account.state !== 5).length;
      this.setLoansData(loansArr);
    } catch (e) {
      if ((e as Error).message.includes("503 Service Unavailable")) {
        toast.error("Solana RPC currently unavailable, please try again in a moment", {
          autoClose: 3000,
          position: "top-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      console.log(e);
    }
  };

  @action.bound setNftData = (data: INftCoreData): void => {
    this.nftData = data;
  };

  @action.bound setLoansData = (data: LoanInterface[]): void => {
    this.loansData = data;
  };
}
