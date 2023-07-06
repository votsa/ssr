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
  console.log('searchParams.facilities', searchParams.facilities)
  const urlParameters = removeEmpty({
    placeId: searchParams.placeId,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    rooms: searchParams.rooms,
    anonymousId: 'anonymous-id',
    searchId: 'search-id',
    language: 'en',
    currency: 'USD',
    brand: 'vio',
    profileId: 'findhotel-website',
    deviceType: 'desktop',
    offset: searchParams.offset ?? 0,
    variations: 'sapi4eva-hso-ctr-b',
    facilities: typeof searchParams.facilities === 'object' ? searchParams.facilities?.join(',') : searchParams.facilities
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
    searchId: 'search-id',
    clientRequestId: 'client-request-id',
    language: 'en',
    currency: 'USD',
    brand: 'vio',
    deviceType: 'desktop',
    cugDeals: 'signed_in,offline,sensitive,prime,fsf'
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
    searchId: 'next-js-vio-test-id',
    clientRequestId: 'next-js-vio-test-request-id',
    locale: 'en',
    currency: 'USD',
    countryCode: 'NL',
    userAgent: 'next-js-vio-test',
    deviceType: 'desktop',
    offersCount: 1,
    rand: new Date().getTime(),
  })

  return new URLSearchParams(urlParameters).toString()
}

export async function availabilitySearch(searchParams: AvailabilityParams) {
  const requestString = createAvailabilityRequestString(searchParams)

  const offersUrl = `${process.env.NEXT_PUBLIC_AVAILABILITY_API_HOSTNAME}/v3/search?${requestString}`

  const res = await fetch(offersUrl, {
    headers: {
      'X-API-Key': process.env.NEXT_PUBLIC_AVAILABILITY_API_KEY
    }
  })
 
  if (!res.ok) {
    throw new Error('Failed to fetch availability data')
  }
 
  return res.json()
}
