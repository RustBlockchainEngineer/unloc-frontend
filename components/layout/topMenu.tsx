import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { localesTop } from "@constants/locales";

export const TopMenu = () => {
  const router = useRouter();

  const handleCurrent = (path: string): string => {
    return `top-nav__page ${router.pathname === path ? "active" : ""}`;
  };

  return (
    <ul className="top-menu">
      <li>
        <Link href="/">
          <a className={handleCurrent("/")}><div className={handleCurrent("/") + ' mobile-wrapper'}>{localesTop.home}</div></a>
        </Link>
      </li>
      <li>
        <Link href="/my-offers">
          <a className={handleCurrent("/my-offers")}><div className={handleCurrent("/my-offers") + ' mobile-wrapper'}>{localesTop.myOffers}</div></a>
        </Link>
      </li>
      <li>
        <Link href="/loans-given">
          <a className={handleCurrent("/loans-given")}><div className={handleCurrent("/loans-given") + ' mobile-wrapper'}>{localesTop.loansGiven}</div></a>
        </Link>
      </li>
    </ul>
  );
};
