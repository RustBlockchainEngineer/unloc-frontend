export const countDuplicatesToProperty = (data: any[], propertyBy: string, propertyTo: string) => {
  return Object.values(
    data.reduce((r: any, e: any) => {
      let key = `${e[propertyBy]}`
      if (!r[key]) r[key] = { ...e, count: 1 }
      else r[key][propertyTo] += 1
      return r
    }, {})
  )
}
