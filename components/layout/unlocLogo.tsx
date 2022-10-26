import React, { useContext } from "react";

import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";

import { StoreContext } from "@pages/_app";

interface UnlocLogoProps {
  classNames?: string;
}
export const UnlocLogo: React.FC<UnlocLogoProps> = observer(({ classNames }: UnlocLogoProps) => {
  const store = useContext(StoreContext);
  const { theme } = store.Interface;

  return (
    <div className={`unloc-logo ${classNames ?? ""}`}>
      <Link href="/">
        <a>
          {theme === "light" ? (
            <Image src="/layout/unloc_logo.svg" alt="Unloc Logo" width={247} height={72} />
          ) : (
            <Image src="/layout/unloc_logo-light.svg" alt="Unloc Logo" width={247} height={72} />
          )}
        </a>
      </Link>
    </div>
  );
});
