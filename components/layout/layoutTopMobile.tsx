import React, { useState } from "react";

import { TopMenu } from "./topMenu";
import { UserToolbox } from "./userToolbox";

export const LayoutTopMobile = () => {
  const [menuVisible, setMenuVisibility] = useState(false);

  return (
    <>
      <div className={`layout-top-mobile`}>
        <TopMenu mobileVisible={menuVisible} />
        <UserToolbox hideMenu={setMenuVisibility} isMenuHidden={menuVisible} />
      </div>
    </>
  );
};
