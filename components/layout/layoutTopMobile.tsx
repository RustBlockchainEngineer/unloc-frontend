import React, { useCallback, useEffect, useState } from "react";

import { TopMenu } from "./topMenu";
import { UserToolbox } from "./userToolbox";

export const LayoutTopMobile = () => {
  const [menuVisible, setMenuVisibility] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  });

  const scrollHandler = useCallback(() => {
    setMenuVisibility(false);
  }, []);

  return (
    <>
      <div className={`layout-top-mobile`}>
        <UserToolbox hideMenu={setMenuVisibility} isMenuHidden={menuVisible} />
        <TopMenu mobileVisible={menuVisible} />
      </div>
    </>
  );
};
