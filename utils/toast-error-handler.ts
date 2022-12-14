import { initCusper } from "@metaplex-foundation/cusper";
import { errorFromCode } from "@unloc-dev/unloc-sdk-loan";
import { toast, ToastOptions } from "react-toastify";

const options: ToastOptions = {
  autoClose: 5000,
  position: "top-center",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const error = (string: string): string | number => toast.error(string, options);
const success = (string: string): string | number => toast.success(string, options);
const cusper = initCusper(errorFromCode);

export const errorCase = (err: any): string | number => {
  if (typeof err !== "string") {
    const serverErr = (err as Error).message.includes("503 Service Unavailable");
    if (serverErr) return error("Solana RPC currently unavailable, please try again in a moment");
  }

  if (err?.error?.logs !== undefined) {
    const decodedError = cusper.errorFromProgramLogs(err.error.logs);
    if (decodedError != null) {
      console.log(JSON.stringify(decodedError));
      return error(`${decodedError.name} ${decodedError.message}`);
    }
  }

  switch (typeof err === "string" ? err : err.message) {
    case "User rejected the request.":
      return error("Transaction rejected");
    case "Failed to sign transaction":
      return error("Failed to sign transaction");
    case "You are not whitelisted!":
      return error("You are not whitelisted!");
    default:
      return error("Something went wrong");
  }
};

export const successCase = (status: string, param?: string): string | number => {
  switch (status) {
    case "Loan Offer Created":
      return success(status);
    case "Loan Accepted":
      return success(status);
    case "Collateral Created":
      return success(status);
    case "Changes Saved":
      return success(status);
    case "NFT Claimed":
      return success(status);
    case "Offer canceled":
      return success(status);
    case "Loan Repayed, NFT is back in your wallet":
      return success(status);
    case "Staking account created":
      return success(status);
    case `NFT ${param as string} returned to the wallet`:
      return success(`NFT ${param as string} returned to the wallet`);
    default:
      return success("Unexpected message");
  }
};
