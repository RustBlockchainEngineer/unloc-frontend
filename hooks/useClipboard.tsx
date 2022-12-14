import { useState } from "react";

export const useClipboard = (clipboardData: string): [boolean, () => void] => {
  const [visible, setVisible] = useState(false);

  const setClipboard = (): void => {
    setVisible(true);
    void navigator.clipboard.writeText(clipboardData);

    const t = setTimeout(() => {
      setVisible(false);
      clearTimeout(t);
    }, 1000);
  };

  return [visible, setClipboard];
};
