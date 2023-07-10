import {SearchParams} from './types'

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

function createSearchRequestString(
  searchParams: SearchParams
) {
  const urlParameters = removeEmpty({
    placeId: searchParams.placeId,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    rooms: searchParams.rooms,
    pageSize: searchParams.pageSize,
    anonymousId: 'anonymous-id',
    searchId: searchParams.searchId,
    language: 'en',
    currency: 'EUR',
    countryCode: 'NL',
    brand: 'vio',
    profileId: 'findhotel-website',
    deviceType: 'desktop',
    cugDeals: 'signed_in,offline,sensitive,prime,fsf',
    tier: 'plus',
    offset: searchParams.offset ?? 0,
    attributes: searchParams.attributes,
    facilities: typeof searchParams.facilities === 'object' ? searchParams.facilities?.join(',') : searchParams.facilities,
    //variations: 'sapi4eva-hso-ctr-b,sapi4eva-imagedb-b,sapi4eva-own-place-hotel-mapping-2-b,sapi4eva-preheat-anchor-offers-b,sapi4eva-room-bundles-b,sapi4eva-price-range-v2-b,'
  })

  return new URLSearchParams(urlParameters).toString()
}


export async function getSearchResults(searchParams: SearchParams) {
  const requestString = createSearchRequestString(searchParams)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOSTNAME}/search?${requestString}`)
 
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
 
  return res.json()
}

function createOffersRequestString(
  hotelIds: string[],
  searchParams: SearchParams
) {
  const urlParameters = removeEmpty({
    hotelIds: hotelIds?.join(','),
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    rooms: searchParams.rooms,
    anonymousId: 'anonymous-id',
    searchId: searchParams.searchId,
    clientRequestId: 'client-request-id',
    language: 'en',
    currency: 'EUR',
    countryCode: 'NL',
    brand: 'vio',
    deviceType: 'desktop',
    cugDeals: 'signed_in,offline,sensitive,prime,fsf',
    tier: 'plus'
  })

  return new URLSearchParams(urlParameters).toString()
}

export async function getOffers(hotelIds: string[], searchParams: SearchParams) {
  const requestString = createOffersRequestString(hotelIds, searchParams)

  const offersUrl = `${process.env.NEXT_PUBLIC_API_HOSTNAME}/offers?${requestString}`

  const res = await fetch(offersUrl)
 
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
 
  return res.json()
}


export interface AvailabilityParams extends SearchParams {
  hotelIds: string[]
}

function createAvailabilityRequestString(
  searchParams: AvailabilityParams
) {
  const urlParameters = removeEmpty({
    destination: searchParams.hotelIds?.join(','),
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    rooms: searchParams.rooms,
    anonymousId: 'next-js-vio-test-id',
    searchId: searchParams.searchId,
    clientRequestId: 'next-js-vio-test-request-id',
    locale: 'en',
    currency: 'EUR',
    countryCode: 'NL',
    userAgent: 'Mozilla%2F5.0+%28Macintosh%3B+Intel+Mac+OS+X+10_15_7%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F114.0.0.0+Safari%2F537.36',
    deviceType: 'desktop',
    offersCount: 3,
    roomLimit: 2,
    tier: 'plus',
    cugDeals: 'signed_in,offline,sensitive,prime,fsf',
    rand: new Date().getTime(),
  })

  return new URLSearchParams(urlParameters).toString()
}

export async function availabilitySearch(searchParams: AvailabilityParams) {
  const requestString = createAvailabilityRequestString(searchParams)

  const offersUrl = `${process.env.NEXT_PUBLIC_AVAILABILITY_API_HOSTNAME}/v3/search?${requestString}`

  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set('X-API-Key', process.env.NEXT_PUBLIC_AVAILABILITY_API_KEY as string)

  const res = await fetch(offersUrl, {
    headers: requestHeaders
  })
 
  if (!res.ok) {
    throw new Error('Failed to fetch availability data')
  }
 
  return res.json()
}
