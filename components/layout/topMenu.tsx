import { useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/router";

import { localesTop } from "@constants/locales";

interface TopMenuProps {
  mobileVisible: boolean;
}

export const TopMenu = ({ mobileVisible }: TopMenuProps): JSX.Element => {
  const router = useRouter();

  const handleCurrent = (path: string): string => {
    return `top-nav__page ${router.pathname === path ? "active" : ""}`;
  };

  const menuList = useCallback(() => {
    return Object.keys(localesTop).map((item) => {
      const snakeCaseName: string = localesTop[item].replace(/\s/, "-").toLowerCase();
      return (
        <li key={item}>
          <Link href={item === "home" ? "/" : `/${snakeCaseName}`}>
            <a className={handleCurrent(item === "home" ? "/" : `/${snakeCaseName}`)}>
              {localesTop[item]}
            </a>
          </Link>
        </li>
      );
    });
  }, []);

  return <ul className={`top-menu ${mobileVisible ? "" : "mobile-hide"}`}>{menuList()}</ul>;
};
