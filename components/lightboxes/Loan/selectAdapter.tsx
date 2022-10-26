// eslint-disable-next-line import/named
import { FieldInputProps } from "react-final-form";

import { CustomSelect } from "@components/layout/customSelect";

interface ISelectAdapter {
  input: FieldInputProps<string, HTMLElement>;
}

export const SelectAdapter = ({
  input: { value, onChange },
  ...props
}: ISelectAdapter): JSX.Element => {
  return (
    <CustomSelect
      options={["USDC", "SOL"]}
      selectedOption={value}
      setSelectedOption={onChange}
      {...props}
    />
  );
};
