export function daysDifference(a: string, b: string) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24

  const dateA =  new Date(a)
  const dateB =  new Date(b)
  
  const utc1 = Date.UTC(dateA.getFullYear(), dateA.getMonth(), dateA.getDate())
  const utc2 = Date.UTC(dateB.getFullYear(), dateB.getMonth(), dateB.getDate())

  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}
