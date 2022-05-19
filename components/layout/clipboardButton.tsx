import { useClipboard } from "@hooks/useClipboard";

interface ClipboardButtonProps {
  data: string;
  classNames?: string;
  state?: boolean;
}

export const ClipboardButton = ({ data, classNames, state }: ClipboardButtonProps) => {
  const [visible, setVisible] = useClipboard(data);

  return (
    <i
      className={`icon icon--sm icon--copy clipboard-icon ${classNames}`}
      onClick={() => setVisible()}>
      <span className={`popup popup--clipboard ${visible || state ? "" : "hidden"}`}>
        Copied to Clipboard!
      </span>
    </i>
  );
};
