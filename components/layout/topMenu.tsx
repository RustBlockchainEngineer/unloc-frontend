import { useCallback } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import { localesTop } from "@constants/locales";

interface TopMenuProps {
  mobileVisible: boolean;
}

export const TopMenu = ({ mobileVisible }: TopMenuProps) => {
  const router = useRouter();

  const handleCurrent = (path: string): string => {
    return `top-nav__page ${router.pathname === path ? "active" : ""}`;
  };

  const menuList = useCallback(() => {
    return Object.keys(localesTop).map((item) => {
      const snakeCaseName = localesTop[item].replace(/\s/, "-").toLowerCase();
      return (
        //TODO: temporary statement
        item !== "myProfile" && (
          <li key={item}>
            <Link href={item === "home" ? "/" : `/${snakeCaseName}`}>
              <a className={handleCurrent(item === "home" ? "/" : `/${snakeCaseName}`)}>
                {localesTop[item]}
              </a>
            </Link>
          </li>
        )
      );
    });
  }, []);

  return <ul className={`top-menu ${mobileVisible ? "" : "mobile-hide"}`}>{menuList()}</ul>;
};
