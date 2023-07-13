/**
 * Removes empty properties from an object
 */
export function removeEmpty(object: Record<string, any>): Record<string, any> {
  return (
    Object.entries(object)
      .filter(([_, v]) => v !== null && v !== undefined)
      .reduce(
        (acc, [k, v]) => ({
          ...acc,
          [k]: v === new Object(v) ? removeEmpty(v) : v,
        }),
        {},
      )
  )
}
