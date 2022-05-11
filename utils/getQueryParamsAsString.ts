// https://stackoverflow.com/questions/71273690/how-to-use-query-params-in-next-js
export function getQueryParamAsString(paramValue: string | string[] | undefined) {
  if (paramValue) {
    return typeof paramValue === "string" ? paramValue : paramValue[0];
  } else {
    return "";
  }
}
