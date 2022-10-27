import Slider from "rc-slider";
// eslint-disable-next-line import/named
import { FieldInputProps } from "react-final-form";
import "rc-slider/assets/index.css";

interface ISliderAdapter {
  input: FieldInputProps<number, HTMLElement>;
}

export const SliderAdapter = ({ input, ...props }: ISliderAdapter): JSX.Element => {
  return <Slider {...input} {...props} />;
};
