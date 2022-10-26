import { useCallback } from "react";

// eslint-disable-next-line import/named
import { FieldInputProps } from "react-final-form";

import { SwitchButton } from "@components/layout/switchButton";

interface ISwitchAdapter {
  input: FieldInputProps<string, HTMLElement>;
}

export const SwitchAdapter = ({
  input: { value, onChange },
  ...props
}: ISwitchAdapter): JSX.Element => {
  const handler = useCallback(
    (state: boolean): void => {
      onChange(state ? "interest_input" : "apr_input");
    },
    [onChange],
  );

  return <SwitchButton state={value !== "apr_input"} onClick={handler} {...props} />;
};
