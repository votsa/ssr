'use client'

import {v4 as uuidv4} from 'uuid'
import {removeEmpty} from '@/src/app/utils'

import {SearchParams, OfferEntity, Hotel} from './types'
import {User} from './user'

function createOffersRequestString(
  hotelIds: string[],
  searchParams: SearchParams,
  user: User,
  isAnchor: boolean,
  sessionId?: string
) {
  const urlParameters = removeEmpty({
    sessionId,
    hotelIds: isAnchor ? undefined : hotelIds?.join(','),
    anchorHotelId: isAnchor ? hotelIds[0] : undefined,
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

function offersArrayToObject(results: OfferEntity[] = []) {
  const offerEntities: Record<string, OfferEntity> = {}

  results.forEach((offerEntity) => {
    offerEntities[offerEntity.id] = offerEntity
  })

  return offerEntities
}

export interface OffersResponse {
  offerEntities: Record<string, OfferEntity>
  sessionId?: string
  status: {
    complete: boolean
  }
}

export async function fetchOffers(
  hotelIds: string[],
  searchParams: SearchParams,
  user: User,
  isAnchor: boolean,
  sessionId?: string
): Promise<OffersResponse> {
  const requestString = createOffersRequestString(hotelIds, searchParams, user, isAnchor, sessionId)

  const offersUrl = `${process.env.NEXT_PUBLIC_API_HOSTNAME}/offers/poll?${requestString}`

  const res = await fetch(offersUrl)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  const response = await res.json()

  return {
    sessionId: response.sessionId,
    status: response.status,
    offerEntities: offersArrayToObject(response.results)
  }
}

export async function getOffers(
  hotelIds: string[],
  searchParams: SearchParams,
  user: User,
  isAnchor: boolean,
  callBack: (response: OffersResponse) => void,
) {

  return new Promise((resolve) => {
    async function poll(
      sessionId?: string
    ) {
      const response = await fetchOffers(hotelIds, searchParams, user, isAnchor, sessionId)

      callBack(response)

      if (response.status.complete !== true) {
        setTimeout(() => {
          poll(response.sessionId)
        }, 0)
      } else {
        resolve(response)
      }
    }

    poll()
  })
}

export interface Results {
  hotelIds: string[]
  hotelEntities: Record<string, Hotel>
  offerEntities: Record<string, OfferEntity>
  hasMoreResults: boolean
}

export async function getData(searchParams: SearchParams, user: User): Promise<Results> {
  const requestString = new URLSearchParams({
    ...searchParams as unknown as URLSearchParams,
    anonymousId: user.anonymousId,
  }).toString()

  const requestUrl = `/search/api?${requestString}`

  const res = await fetch(requestUrl)
 
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}
