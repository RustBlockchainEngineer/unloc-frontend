import Slider from "rc-slider";
import { FieldInputProps } from "react-final-form";
import "rc-slider/assets/index.css";

interface ISliderAdapter {
  input: FieldInputProps<number, HTMLElement>;
}

export const SliderAdapter = ({ input, ...props }: ISliderAdapter) => {
  return <Slider {...input} {...props} />;
};
