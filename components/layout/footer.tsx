import { memo, ReactNode } from "react";

import { localesFooterCommunity } from "@constants/locales";

export const Footer = memo(() => {
  const createList = (data: { [key: string]: string }): ReactNode => {
    return Object.entries(data).map(([key, value]) => (
      <li className="list-item" key={key}>
        <a href={value}>{key}</a>
      </li>
    ));
  };

  return (
    <div className="footer">
      <div className="footer-links">
        <div className="community-section">
          <ul className="footer-list">{createList(localesFooterCommunity)}</ul>
        </div>
      </div>
    </div>
  );
});
