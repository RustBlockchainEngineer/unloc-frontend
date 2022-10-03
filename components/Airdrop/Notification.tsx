import React from "react";
import { toast, ToastContent, ToastOptions } from "react-toastify";

const options: ToastOptions = {
  autoClose: 5000,
  position: "top-left",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const error = (content: ToastContent) => toast.error(content, options);
const success = (content: ToastContent) => toast.success(content, options);

export function notify({
  message,
  txid,
  type = "success",
}: {
  message: string;
  txid?: string;
  type?: string;
}) {
  type == "success"
    ? success(
        <div>
          <span>{message}</span>
          {txid && (
            <a
              rel="noreferrer"
              target="_blank"
              href={`https://solscan.io/tx/${txid}${"?cluster=devnet"}`}>
              View transaction {txid.slice(0, 8)}...
              {txid.slice(txid.length - 8)}
            </a>
          )}
        </div>,
      )
    : error(message);
}
