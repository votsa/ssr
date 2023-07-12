'use client'

import {useCallback, useState, useEffect} from 'react'
import {SearchParams, Hotel, OfferEntity} from './types'
import {getOffers} from './apis'

interface Results {
  hotelIds: string[]
  hotelEntities: Record<string, Hotel>
  offerEntities: Record<string, OfferEntity>
  hasMoreResults: boolean
}

export async function getData(searchParams: SearchParams): Promise<Results> {
  const requestString = new URLSearchParams(searchParams as unknown as URLSearchParams).toString()

  const requestUrl = `/search/api?${requestString}`

  const res = await fetch(requestUrl)
 
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

const CLIENT_PAGE_SIZE = 20

export const useSearch = (searchParams: SearchParams, initialResults: Results) => {
  const [isComplete, setIsComplete] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMoreResults, setHasMoreResults] = useState(initialResults.hasMoreResults)
  const [hotelIds, setHotelIds] = useState(initialResults.hotelIds)
  const [hotelEntities, setHotelEntities] = useState(initialResults.hotelEntities)
  const [offerEntities, setOfferEntities] = useState(initialResults.offerEntities)

  useEffect(() => {
    async function loadOffers() {
      setIsComplete(false)

      const offers = await getOffers(hotelIds, searchParams)

      const offerEntities: Record<string, OfferEntity> = {}

      offers.results?.forEach((offerEntity) => {
        offerEntities[offerEntity.id] = offerEntity
      })

      setOfferEntities((existingOfferEntities) => ({
        ...existingOfferEntities,
        ...offerEntities
      }))

      setIsComplete(true)
    }

    void loadOffers()
  }, [])

  useEffect(() => {
    async function loadHotels() {
      setIsComplete(false)

      const offset = CLIENT_PAGE_SIZE * page

      const nextPage = await getData({...searchParams, offset })

      setHotelIds((existingHotelIds) => {
        const hotelIds = [
          ...existingHotelIds,
          ...nextPage.hotelIds
        ]

        return [...new Set(hotelIds)]
      })
  
      setHotelEntities((pages) => ({
        ...pages,
        ...nextPage.hotelEntities
      }))
  
      setOfferEntities((existingOfferEntities) => ({
        ...existingOfferEntities,
        ...nextPage.offerEntities
      }))

      setHasMoreResults(nextPage.hasMoreResults)

      const offers = await getOffers(nextPage.hotelIds, searchParams)

      const offerEntities: Record<string, OfferEntity> = {}

      offers.results?.forEach((offerEntity) => {
        offerEntities[offerEntity.id] = offerEntity
      })

      setOfferEntities((existingOfferEntities) => ({
        ...existingOfferEntities,
        ...offerEntities
      }))

      setIsComplete(true)
    }

    if (page > 1) {
      void loadHotels()
    }
  }, [page, searchParams])

  const handleLoadMore = useCallback(() => {
    setPage((page) => page + 1)
  }, [setPage])

  const hotelIdsToDisplay = hotelIds.slice(0, (CLIENT_PAGE_SIZE * page))

  return {
    isComplete,
    hasMoreResults,
    hotelEntities,
    offerEntities,
    hotelIds: hotelIdsToDisplay,
    onLoadMore: handleLoadMore
  }
}
