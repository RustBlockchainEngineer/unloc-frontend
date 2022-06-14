import { toast } from "react-toastify";

const options = {
  autoClose: 3000,
  position: "top-center",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// @ts-ignore
const error = (string: string) => toast.error(string, options);
// @ts-ignore
const success = (string: string) => toast.success(string, options);

export const errorCase = (err: any) => {
  if (typeof err !== "string") {
    const serverErr = (err as Error).message.includes("503 Service Unavailable");
    if (serverErr) {
      return error("Solana RPC currently unavailable, please try again in a moment");
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

export const successCase = (status: string, param?: string) => {
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
    case `NFT ${param} returned to the wallet`:
      return success(`NFT ${param} returned to the wallet`);
    default:
      return;
  }
};
