import { action, makeAutoObservable, flow } from "mobx";
import axios from "axios";
import * as anchor from "@project-serum/anchor";
import { getSubOfferList, getOffersBy } from "@integration/nftLoan";
import { NftCoreData } from "../@types/nft";
import { getMetadata } from "@integration/nftIntegration";
import { getDecimalsForLoanAmount } from "@integration/getDecimalForLoanAmount";
import { calculateRepayValue } from "@utils/calculateRepayValue";
import { currencyMints } from "@constants/currency";
import { toast } from "react-toastify";
import { getDurationFromContractData } from "@utils/getDuration";
interface LoanInterface {
  id: string;
  status: number;
  amount: string;
  currency: string;
  duration: number;
  apr: number;
  offerMint: string;
  publicKey: anchor.web3.PublicKey;
  totalRepay?: any;
}

export class SingleOfferStore {
  rootStore;
  nftData = {} as NftCoreData;
  loansData: LoanInterface[] = [];
  isYours: boolean = false;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action.bound fetchNft = flow(function* (this: SingleOfferStore, id: string) {
    const subOfferKey = new anchor.web3.PublicKey(id);
    const metadata = yield getMetadata(subOfferKey);
    const collection = yield axios.post("/api/collections/nft", { id: subOfferKey.toBase58() });
    if (collection && metadata && metadata.arweaveMetadata) {
      this.setNftData({
        ...metadata.arweaveMetadata,
        collection: collection.data,
        mint: subOfferKey.toBase58(),
      });
    }
  });

  @action.bound fetchSubOffers = async (id: string): Promise<void> => {
    try {
      const subOfferKey = new anchor.web3.PublicKey(id);

      const data = await getSubOfferList(undefined, subOfferKey, 0);
      const loansArr: Array<LoanInterface> = [];
      data.forEach((element) => {
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
          currency: currencyMints[element.account.offerMint.toBase58()],
          duration: durationConverted, // suspecting wrong type here, also we are showing loans with 0 day duration this is wrong
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

  @action.bound async getOffersByWallet(): Promise<void> {
    const offersData = await getOffersBy(this.rootStore.Wallet.walletKey, undefined, undefined);
    this.checkIfYours(offersData);
  }

  @action.bound checkIfYours = (data: any[]): void => {
    const isYours = data.some((item) => item.account.nftMint.toBase58() === this.nftData.mint);
    this.setIsYours(isYours);
  };

  @action.bound setNftData = (data: NftCoreData): void => {
    this.nftData = data;
  };

  @action.bound setLoansData = (data: LoanInterface[]): void => {
    this.loansData = data;
  };

  @action.bound setIsYours = (isYours: boolean): void => {
    this.isYours = isYours;
  };
}
