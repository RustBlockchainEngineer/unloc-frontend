import React from "react";
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

  return (
    <ul className={`top-menu ${mobileVisible ? "" : "mobile-hide"}`}>
      <li>
        <Link href="/">
          <a className={handleCurrent("/")}>{localesTop.home}</a>
        </Link>
      </li>
      <li>
        <Link href="/my-offers">
          <a className={handleCurrent("/my-offers")}>{localesTop.myOffers}</a>
        </Link>
      </li>
      <li>
        <Link href="/loans-given">
          <a className={handleCurrent("/loans-given")}>{localesTop.loansGiven}</a>
        </Link>
      </li>
      <li>
        <Link href="/my-profile">
          <a className={handleCurrent("/my-profile")}>{localesTop.myProfile}</a>
        </Link>
      </li>
    </ul>
  );
};
