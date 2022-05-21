import revealIcon from "@constants/icons/svg/Triangle.svg";
import copyIcon from "@constants/icons/svg/copy.svg";
import { IDynamicKeyStringPair } from "@constants/most-used-structures";

//TODO: seems like this component never used so I'd like to remove it
export const icons: IDynamicKeyStringPair = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  copy: copyIcon,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  reveal: revealIcon,
};
