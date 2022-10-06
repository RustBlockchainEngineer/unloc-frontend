import { useContext } from "react";

import { StoreContext } from "@pages/_app";
import { RootStore } from "@stores/Root.store";

export const useStore = (): RootStore => {
  return useContext(StoreContext);
};
