import {v4 as uuidv4} from 'uuid'
import {removeEmpty} from '@/src/app/utils'

import {SearchParams, OfferEntity, Hotel, UserRequestParams} from './types'
import {getUser} from './user'


function parseStarRatings(starRatings?: string | string[]) {
  if (typeof starRatings === 'string') {
    return (starRatings as string).split(',').map(Number)
  } else if (typeof starRatings === 'object') {
    return starRatings.map(Number)
  }
}

export function requestToSearchParams(requests: UserRequestParams, searchId: string): SearchParams {
  return {
    ...requests,
    starRatings: parseStarRatings(requests.starRatings),
    offset: Number(requests.offset ?? 0),
    rooms: requests.rooms ?? '2',
    searchId
  } as SearchParams
}

function createSearchRequestString(
  searchParams: SearchParams
) {
  const user = getUser()

  const urlParameters = removeEmpty({
    placeId: searchParams.hotelId ? undefined : searchParams.placeId,
    hotelId: searchParams.hotelId,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    rooms: searchParams.rooms,
    pageSize: searchParams.pageSize,
    anonymousId: user.anonymousId,
    searchId: searchParams.searchId,
    language: 'en',
    currency: 'EUR',
    countryCode: user.countryCode,
    brand: 'vio',
    profileId: 'findhotel-website',
    deviceType: 'desktop',
    cugDeals: 'signed_in,offline,sensitive,prime,fsf',
    tier: 'plus',
    offset: searchParams.offset,
    attributes: searchParams.attributes,
    facilities: typeof searchParams.facilities === 'object' ? searchParams.facilities?.join(',') : searchParams.facilities,
    starRating: searchParams.starRatings && searchParams.starRatings?.join(','),
    variations: 'sapi4eva-hso-ctr-b,sapi4eva-imagedb-b,sapi4eva-own-place-hotel-mapping-2-b,sapi4eva-preheat-anchor-offers-b,sapi4eva-room-bundles-b,sapi4eva-price-range-v2-b'
  })

  return new URLSearchParams(urlParameters).toString()
}

export async function getSearchResults(searchParams: SearchParams) {
  const requestString = createSearchRequestString(searchParams)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOSTNAME}/search?${requestString}`)
 
  if (!res.ok) {
    throw new Error('Failed to fetch hotel results')
  }
 
  return res.json()
}

function createAnchorRequestString(
  searchParams: SearchParams
) {
  const user = getUser()

  const urlParameters = removeEmpty({
    placeId: searchParams.hotelId ? undefined : searchParams.placeId,
    hotelId: searchParams.hotelId,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    rooms: searchParams.rooms,
    pageSize: searchParams.pageSize,
    anonymousId: user.anonymousId,
    searchId: searchParams.searchId,
    language: 'en',
    currency: 'EUR',
    countryCode: user.countryCode,
    brand: 'vio',
    profileId: 'findhotel-website',
    deviceType: 'desktop',
    cugDeals: 'signed_in,offline,sensitive,prime,fsf',
    tier: 'plus',
    attributes: 'anchor,anchorHotelId,anchorType,hotelEntities,searchParameters',
    variations: 'sapi4eva-hso-ctr-b,sapi4eva-imagedb-b,sapi4eva-own-place-hotel-mapping-2-b,sapi4eva-preheat-anchor-offers-b,sapi4eva-room-bundles-b,sapi4eva-price-range-v2-b'
  })

  return new URLSearchParams(urlParameters).toString()
}

export async function getAnchor(searchParams: SearchParams) {
  const requestString = createAnchorRequestString(searchParams)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOSTNAME}/anchor?${requestString}`)
 
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
 
  return res.json()
}

export interface OffersParams extends SearchParams {
  hotelIds?: string[]
  anchorHotelId?: string
}

interface OffersResponse {
  results: OfferEntity[]
}

function createOffersRequestString(
  searchParams: OffersParams,
  sessionId?: string
) {
  const user = getUser()

  const urlParameters = removeEmpty({
    sessionId,
    hotelIds: searchParams.hotelIds?.join(','),
    anchorHotelId: searchParams.anchorHotelId,
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    rooms: searchParams.rooms,
    anonymousId: user.anonymousId,
    searchId: searchParams.searchId,
    language: 'en',
    currency: 'EUR',
    countryCode: user.countryCode,
    brand: 'vio',
    deviceType: 'desktop',
    cugDeals: 'signed_in,offline,sensitive,prime,fsf',
    tier: 'plus',
    clientRequestId: uuidv4()
  })

  return new URLSearchParams(urlParameters).toString()
}

export async function fetchOffers(searchParams: OffersParams, sessionId?: string) {
  const requestString = createOffersRequestString(searchParams, sessionId)

  const offersUrl = `${process.env.NEXT_PUBLIC_API_HOSTNAME}/offers/poll?${requestString}`

  const response = await fetch(offersUrl)

  if (!response.ok) {
    throw new Error('Failed to fetch availability data')
  }
 
  return response.json()
}

export function getAvailability(params: OffersParams, polls = 5): Promise<OffersResponse> {
  let pollsCount = 0

  const CLIENT_PAGE_SIZE = params.offset === 0 ? 40 : 20

  const log = createLogger()

  return new Promise((resolve) => {
    async function poll(sessionId?: string) {
      const response = await fetchOffers(params, sessionId)

      let availability = 0

      response.results?.forEach((res: OfferEntity) => {
        if (res.offers?.length) availability++
      })

      pollsCount++

      if (params.anchorHotelId) {
        log('Anchor Availability iteration', `polls = ${polls}, iteration = ${pollsCount}, available = ${availability}`)
      } else {
        log('Availability iteration', `pageSize = ${CLIENT_PAGE_SIZE}, iteration = ${pollsCount}, requested = ${params.hotelIds?.length} available = ${availability}`)
      }

      if (pollsCount >= polls || response?.status.complete || (availability >= CLIENT_PAGE_SIZE && pollsCount > 1)) {
        pollsCount = 0

        resolve(response)
      } else {
        setTimeout(() => {
          poll(response.sessionId)
        }, 0);
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

    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log('LOG:-------------->', name, timeDifference, value)
    }
  }
}

const CLIENT_PAGE_OFFSET = 5
const CLIENT_PAGE_SIZE = 20

export async function getResultsWithAvailability(params: SearchParams) {
  const log = createLogger()

  const searchParams = {
    ...params,
    offset: Number(params?.offset ?? 0)
  }

  const REQUEST_PAGE_SIZE = searchParams.offset === 0 ? 40 : 20

  log('Search start')

  const staticResults = await getSearchResults({
    ...searchParams,
    pageSize: 250,
    offset: 0,
    attributes: 'hotelEntities,hotelIds'
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

  const hotelIds = hotelIdsWithTags.length > REQUEST_PAGE_SIZE
    ? hotelIdsWithTags.slice(searchParams.offset, REQUEST_PAGE_SIZE + CLIENT_PAGE_OFFSET + searchParams.offset)
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
    .slice(searchParams.offset, REQUEST_PAGE_SIZE + searchParams.offset)
    .map((offerEntity) => {
      availableHotelEntities[offerEntity.id] = staticResults.hotelEntities[offerEntity.id]
      availableOfferEntities[offerEntity.id] = offerEntity

      return offerEntity.id
    })

  log('Search complete', `${searchParams.offset}, ${REQUEST_PAGE_SIZE + searchParams.offset}, ${REQUEST_PAGE_SIZE}, ${availableHotels?.length}, ${hotelIdsToReturn?.length}`)

  const hasMoreResults =
    availableHotels.length > CLIENT_PAGE_SIZE + searchParams.offset
    || hotelIdsWithTags.length > CLIENT_PAGE_SIZE + searchParams.offset

  return {
    hasMoreResults,
    hotelEntities: availableHotelEntities,
    offerEntities: availableOfferEntities,
    hotelIds: hotelIdsToReturn
  }
}
