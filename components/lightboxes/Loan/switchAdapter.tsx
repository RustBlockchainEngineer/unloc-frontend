import { SwitchButton } from "@components/layout/switchButton";
import { useCallback } from "react";
import { FieldInputProps } from "react-final-form";

interface ISwitchAdapter {
  input: FieldInputProps<string, HTMLElement>;
}

export const SwitchAdapter = ({ input: { value, onChange }, ...props }: ISwitchAdapter) => {
  const handler = useCallback(
    (state: boolean): void => {
      onChange(state ? "interest_input" : "apr_input");
    },
    [onChange],
  );

  return <SwitchButton state={value !== "apr_input"} onClick={handler} {...props} />;
};
