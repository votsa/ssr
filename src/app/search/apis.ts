import {SearchParams, OfferEntity, Hotel, UserRequestParams} from './types'

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

export function requestToSearchParams(requests: UserRequestParams, searchId: string): SearchParams {
  return {
    ...requests,
    offset: Number(requests.offset ?? 0),
    rooms: requests.rooms ?? '2',
    searchId
  }
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
    offset: searchParams.offset,
    attributes: searchParams.attributes,
    facilities: typeof searchParams.facilities === 'object' ? searchParams.facilities?.join(',') : searchParams.facilities,
    variations: 'sapi4eva-hso-ctr-b,sapi4eva-imagedb-b,sapi4eva-own-place-hotel-mapping-2-b,sapi4eva-preheat-anchor-offers-b,sapi4eva-room-bundles-b,sapi4eva-price-range-v2-b'
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

interface OffersResponse {
  results: OfferEntity[]
  status: boolean
}

export async function getOffers(hotelIds: string[], searchParams: SearchParams): Promise<OffersResponse> {
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

  const response = await fetch(offersUrl, {
    headers: requestHeaders
  })

 
  if (!response.ok) {
    throw new Error('Failed to fetch availability data')
  }
 
  return response.json()
}

const CLIENT_PAGE_SIZE = 20
const MIN_REQUEST_SIZE = CLIENT_PAGE_SIZE + 5

interface AvailabilityResponse {
  results: OfferEntity[]
}

function getAvailability(params: AvailabilityParams): Promise<AvailabilityResponse> {
  let pollsCount = 0

  return new Promise((resolve) => {
    async function poll() {
      const response = await availabilitySearch(params)

      pollsCount++

      if (pollsCount >= 2 || response?.status.complete) {
        pollsCount = 0

        resolve(response)
      } else {
        setTimeout(() => {
          poll()
        }, 700);
      }
    }

    poll()
  })
}

function createLogger() {
  const startTime = Date.now()

  return (name: string, value: any = '') => {
    const timeNow = Date.now()
    const timeDifference = timeNow - startTime

    console.log('LOG:-------------->', name, timeDifference, value)
  }
}

export async function getResultsWithAvailability(params: SearchParams) {
  const log = createLogger()

  const searchParams = requestToSearchParams(params, params.searchId)

  log('Search start')

  const staticResults = await getSearchResults({
    ...searchParams,
    pageSize: 250,
    offset: 0,
    attributes: 'anchor,facets,hotelEntities,hotelIds,offset,resultsCount,resultsCountTotal,searchParameters'
  })

  log('Hotels received', staticResults.hotelIds?.length)

  const hotelIdsWithTags: string[] = []

  if (searchParams.rooms === '2' && searchParams.offset === 0) {
    staticResults.hotelIds.forEach((id: string) => {
      const hotel = staticResults.hotelEntities[id]

      if (hotel?.tags?.length) {
        hotelIdsWithTags.push(id)
      }
    })
  }

  log('Hotels with tags count', hotelIdsWithTags.length)

  const hotelIds = hotelIdsWithTags.length > CLIENT_PAGE_SIZE
    ? hotelIdsWithTags.slice(searchParams.offset, MIN_REQUEST_SIZE + searchParams.offset)
    : staticResults.hotelIds

  log('Availability requested')

  const availability = await getAvailability({
    hotelIds,
    ...searchParams
  })

  log('Availability received')

  const availableHotelEntities: Record<string, Hotel> = {}
  const availableOfferEntities: Record<string, OfferEntity> = {}

  const availableHotels = availability.results.filter(
    (offerEntity) => offerEntity.offers.length !== 0
  )

  const hotelIdsToReturn = availableHotels
    .slice(searchParams.offset, CLIENT_PAGE_SIZE + searchParams.offset)
    .map((offerEntity) => {
      availableHotelEntities[offerEntity.id] = staticResults.hotelEntities[offerEntity.id]
      availableOfferEntities[offerEntity.id] = offerEntity

      return offerEntity.id
    })

  log('Search complete')

  const hasMoreResults =
    availableHotels.length > CLIENT_PAGE_SIZE + searchParams.offset
    || hotelIdsWithTags.length >  CLIENT_PAGE_SIZE + searchParams.offset

  return {
    hasMoreResults,
    hotelEntities: availableHotelEntities,
    offerEntities: availableOfferEntities,
    hotelIds: hotelIdsToReturn
  }
}
