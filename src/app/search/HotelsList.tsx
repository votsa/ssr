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
      {props.hotelIds.map((hotelId, i) => {
        const hotel = props.hotelEntities[hotelId]
        const offerEntity = props.offerEntities[hotelId]

        return (
          <div key={hotel.objectID}>
            <div className="mx-auto w-full my-5 flex max-w-full flex-col md:max-w-full md:flex-row md:items-start md:text-left">
              <div className="mb-4 md:mr-6 md:mb-0 md:w-96">
                <div className="rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full overflow-hidden">
                    {hotel.imageURIs?.length &&
                      <Image
                        src={hotel.imageURIs?.[0]}
                        alt={hotel.hotelName}
                        className="object-cover"
                        width={384}
                        height={192}
                      />
                    }
                  </div>
                  <div className="flex items-center space-x-1 pt-1">
                    {hotel.imageURIs?.slice(1,4).map((url, n) => (
                      <div key={n} className="h-14 bg-gray-200 dark:bg-gray-700 w-24">
                        <Image
                          src={url}
                          alt={hotel.hotelName}
                          className="object-cover"
                          width={96}
                          height={59}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="flex items-center space-x-1 my-1">
                  {Array(hotel.starRating).fill(1).map((i, n) => (
                    <svg key={n} className="w-4 h-4 text-yellow-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                  ))}
                </div>

                <div className="text-xl font-medium">{hotel.hotelName}</div>
                <div className="mb-3 text-sm">{hotel.placeDisplayName}</div> 
                {offerEntity?.offers.length && <OffersList offerEntity={offerEntity} />}
              </div>
            </div>
            <div className="border-b" />
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

      const offset = 20 * page

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
        hotelIds={hotelIds.slice(0, (20 * page))}
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
