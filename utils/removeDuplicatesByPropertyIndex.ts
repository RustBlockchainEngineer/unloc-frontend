export const removeDuplicatesByPropertyIndex = (originalArray: string | any[], objKey: string) => {
  const trimmedArray = []
  const values = []
  let value

  for (var i = 0; i < originalArray.length; i++) {
    value = originalArray[i][objKey]

    if (values.indexOf(value) === -1) {
      trimmedArray.push(originalArray[i])
      values.push(value)
    }
  }
  return trimmedArray
}
