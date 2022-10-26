import { PublicKey } from "@solana/web3.js";

import { useClipboard } from "@hooks/useClipboard";

interface ClipboardButtonProps {
  data: string | PublicKey;
  classNames?: string;
  state?: boolean;
}

export const ClipboardButton = ({ data, classNames, state }: ClipboardButtonProps): JSX.Element => {
  data = typeof data === "string" ? data : data?.toBase58();
  const [visible, setVisible] = useClipboard(data);

  return (
    <i
      className={`icon icon--vs-wide-width icon--copy clipboard-icon ${classNames ?? ""}`}
      onClick={() => setVisible()}>
      <span className={`popup popup--clipboard ${visible || state ? "" : "hidden"}`}>
        Copied to Clipboard!
      </span>
    </i>
  );
};
