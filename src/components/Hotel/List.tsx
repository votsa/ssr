'use client'

import {OffersList} from '@/src/components/Offers'
import {useSearch} from '@/src/app/search/useSearch'
import {SearchParams, Hotel, OfferEntity} from '@/src/app/search/types'

import {HotelCard} from './HotelCard'

interface Props {
  initialResults: {
    hotelIds: string[]
    hotelEntities: Record<string, Hotel>
    offerEntities: Record<string, OfferEntity>
    hasMoreResults: boolean
  }
  searchParams: SearchParams
}

export function HotelsList(props: Props) {
  const {
    isComplete,
    hasMoreResults,
    hotelEntities,
    offerEntities,
    hotelIds,
    onLoadMore
  } = useSearch(props.searchParams, props.initialResults)

  return (
    <>
      {hotelIds.map((hotelId) => {
        const hotel = hotelEntities[hotelId]
        const offerEntity = offerEntities[hotelId]

        return (
          <div key={hotel.objectID}>
            <HotelCard hotel={hotel}>
              <OffersList
                offerEntity={offerEntity}
                isComplete={isComplete}
                searchParams={props.searchParams}
              />
            </HotelCard>
            <div className="border-b mx-3 my-3" />
          </div>
        )
      })}

      <div className="text-center p-4">
        {hasMoreResults && (
          <button className="py-2 px-4 bg-blue-600 rounded text-white" onClick={onLoadMore}>
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
