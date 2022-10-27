import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  ReactElement,
  memo,
} from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  useWalletModal,
  WalletConnectButton,
  WalletModalButton,
  WalletIcon,
} from "@solana/wallet-adapter-react-ui";

import { Button, ButtonProps } from "./Button";
import { DropdownList } from "./DropdownList";

interface WalletCustomButtonProps extends ButtonProps {
  children?: ReactNode;
}

export const WalletCustomButton = memo(({ children, ...props }: WalletCustomButtonProps) => {
  const { publicKey, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLUListElement>(null);

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const content = useMemo(() => {
    if (children) return children;
    if (wallet == null || !base58) return null;
    return base58.slice(0, 4) + ".." + base58.slice(-4);
  }, [children, wallet, base58]);

  const openDropdown = useCallback((): void => {
    setActive(true);
  }, []);

  const closeDropdown = useCallback((): void => {
    setActive(false);
  }, []);

  const openModal = useCallback((): void => {
    setVisible(true);
    closeDropdown();
  }, [closeDropdown]);

  useEffect((): (() => void) => {
    const listener = (event: MouseEvent | TouchEvent): void => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (node == null || node.contains(event.target as Node)) return;

      closeDropdown();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return (): void => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, closeDropdown]);

  if (wallet == null)
    return (
      <WalletModalButton
        {...{
          ...props,
          startIcon: props.startIcon as ReactElement,
          endIcon: props.endIcon as ReactElement,
        }}>
        {children}
      </WalletModalButton>
    );
  if (!base58)
    return (
      <WalletConnectButton
        {...{
          ...props,
          startIcon: props.startIcon as ReactElement,
          endIcon: props.endIcon as ReactElement,
        }}>
        {children}
      </WalletConnectButton>
    );

  return (
    <div className="wallet-adapter-dropdown">
      <Button
        aria-expanded={active}
        className="wallet-adapter-button-trigger"
        style={{ pointerEvents: active ? "none" : "auto", ...props.style }}
        onClick={openDropdown}
        startIcon={<WalletIcon wallet={wallet} />}
        {...props}>
        {content}
      </Button>
      <DropdownList refer={ref} active={active} openModal={openModal} base58={base58} />
    </div>
  );
});
