'use client'

import Image from 'next/image'
import {useCallback, useState, useEffect} from 'react'

import {SearchParams, Hotel, OfferEntity} from './types'
import OffersList from './OffersList'
import {useOffers} from './useOffers'
import {getOffers} from './apis'

interface ListProps {
  hotelEntities: Record<string, Hotel>
  hotelIds: string[]
  offerEntities:  Record<string, OfferEntity>
  isComplete: boolean
}

export function HotelsList(props: ListProps) {
  return (
    <>
      {props.hotelIds.map(hotelId => {
        const hotel = props.hotelEntities[hotelId]
        const offerEntity = props.offerEntities[hotelId]

        return (
          <div className="my-3 p-2 border" key={hotel.objectID}>
            <div className="grid grid-cols-4 gap-4">
              <div>
                {hotel.imageURIs?.[0] &&
                  <Image
                    src={hotel.imageURIs?.[0]}
                    alt="Vercel Logo"
                    className="dark:invert"
                    width={280}
                    height={180}
                  />
                }
              </div>
              <div className="col-span-3">
                <h3 className="text-lg">{hotel.objectID} : {hotel.hotelName}</h3>
                <div className="text-xs">{hotel.placeDisplayName}</div>
                {!props.isComplete && !offerEntity?.offers.length && (
                  <div role="status" className="animate-pulse">
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 my-2 w-full" />
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 my-2 w-full" />
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 my-2 w-full" />
                    <span className="sr-only">Loading...</span>
                  </div>
                )}
                {offerEntity?.offers.length && <OffersList offerEntity={offerEntity} />}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

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

interface ContainerProps {
  initialResults: {
    hotelIds: string[]
    hotelEntities: Record<string, Hotel>
    offerEntities: Record<string, OfferEntity>
    hasMoreResults: boolean
  }
  searchParams: SearchParams
}

export default function HotelsListContainer({initialResults, searchParams}: ContainerProps) {
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

      const offset = 20 * (page - 1)

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

  return (
    <>
      <HotelsList
        isComplete={isComplete}
        hotelIds={hotelIds}
        hotelEntities={hotelEntities}
        offerEntities={offerEntities}
      />
      <div className="text-center p-4">
        {hasMoreResults && (
          <button className="py-2 px-4 bg-blue-600 rounded text-white" onClick={handleLoadMore}>
            {isComplete ? 'Load More' : 'Loading...'}
          </button>
        )}
        {!hasMoreResults && (
          <div className="text-lg text-center">There are no more results for your search</div>
        )}
      </div>
    </>
  )
}
