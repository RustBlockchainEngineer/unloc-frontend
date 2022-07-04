/* eslint-disable import/no-default-export */
/* eslint-disable @typescript-eslint/naming-convention */
import { Decorator } from "final-form";

declare module "final-form-calculate" {
  interface FFUpdatesByName<TFormValues> {
    [FieldName: string]: (value: any, allValues?: TFormValues, prevValues?: TFormValues) => any;
  }

  type FFUpdatesForAll<TFormValues = object> = (
    value: any,
    field: string,
    allValues?: TFormValues,
    prevValues?: TFormValues,
  ) => { [FieldName: string]: any };

  type FFUpdates<TFormValues> = FFUpdatesByName<TFormValues> | FFUpdatesForAll<TFormValues>;

  interface FFCalculation<TFormValues> {
    field: FieldPattern;
    updates: FFUpdates<TFormValues>;
    isEqual?: (a: any, b: any) => boolean;
  }

  export default function createDecorator<TFormValues = object>(
    ...calculations: FFCalculation<TFormValues>[]
  ): Decorator<TFormValues>;
}
