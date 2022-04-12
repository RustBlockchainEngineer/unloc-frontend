export const validateFilterInput = (value: number | string): boolean => {
    if (value != undefined) {
      return true
    } else {
      return false
    }
  }