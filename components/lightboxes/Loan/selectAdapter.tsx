import { CustomSelect } from "@components/layout/customSelect";
import { FieldInputProps } from "react-final-form";

interface ISelectAdapter {
  input: FieldInputProps<string, HTMLElement>;
}

export const SelectAdapter = ({ input: { value, onChange }, ...props }: ISelectAdapter) => {
  return (
    <CustomSelect
      options={["USDC", "SOL"]}
      selectedOption={value}
      setSelectedOption={onChange}
      {...props}
    />
  );
};
