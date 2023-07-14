'use client'

import {useCallback, useState, useEffect, useContext} from 'react'
import {SearchParams} from './types'
import {getOffers, getData, Results} from './clientApi'
import {UserContext} from './UserProvider'

const CLIENT_PAGE_SIZE = 20

export const useSearch = (searchParams: SearchParams, initialResults: Results) => {
  const user = useContext(UserContext)
  const [isComplete, setIsComplete] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMoreResults, setHasMoreResults] = useState(initialResults.hasMoreResults)
  const [hotelIds, setHotelIds] = useState(initialResults.hotelIds)
  const [hotelEntities, setHotelEntities] = useState(initialResults.hotelEntities)
  const [offerEntities, setOfferEntities] = useState(initialResults.offerEntities)

  useEffect(() => {
    async function loadOffers() {
      setIsComplete(false)

      const offersResponse = await getOffers(hotelIds, searchParams, user)

      setOfferEntities((existingOfferEntities) => ({
        ...existingOfferEntities,
        ...offersResponse.offerEntities
      }))

      setIsComplete(true)
    }

    void loadOffers()
  }, [])

  useEffect(() => {
    async function loadNextPage() {
      setIsComplete(false)

      const offset = CLIENT_PAGE_SIZE * page

      const nextPage = await getData({...searchParams, offset }, user)

      setHotelIds((existingHotelIds) => {
        const hotelIds = [
          ...existingHotelIds,
          ...nextPage.hotelIds
        ]

        return [...new Set(hotelIds)]
      })
  
      setHotelEntities((existingHotelEntities) => ({
        ...existingHotelEntities,
        ...nextPage.hotelEntities
      }))
  
      setOfferEntities((existingOfferEntities) => ({
        ...existingOfferEntities,
        ...nextPage.offerEntities
      }))

      setHasMoreResults(nextPage.hasMoreResults)

      const offersResponse = await getOffers(nextPage.hotelIds, searchParams, user)

      setOfferEntities((existingOfferEntities) => ({
        ...existingOfferEntities,
        ...offersResponse.offerEntities
      }))

      setIsComplete(true)
    }

    if (page > 1) {
      void loadNextPage()
    }
  }, [user, page, searchParams])

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
