'use client'

import Image from 'next/image'

import OffersList from './OffersList'
import {useSearch} from './useSearch'
import {imageProviderImgProxyFactory} from './imageProviderFactories'
import {SearchParams, Hotel, OfferEntity} from './types'

interface ListProps {
  hotelEntities: Record<string, Hotel>
  hotelIds: string[]
  offerEntities:  Record<string, OfferEntity>
  isComplete: boolean
}

export type SizeType =
  | 'extraLarge'
  | 'large'
  | 'main'
  | 'medium'
  | 'small'
  | 'mobileLarge'
  | 'mobileMedium'
  | 'mobileSmall'
  | 'gridPrimary'
  | 'gridSecondary'

export const SIZES: Record<SizeType, [number, number]> = {
  extraLarge: [740, 393],
  large: [615, 340],
  main: [292, 284],
  medium: [59, 59],
  small: [38, 38],
  mobileLarge: [620, 176],
  mobileMedium: [620, 152],
  mobileSmall: [126, 152],
  gridPrimary: [456, 330],
  gridSecondary: [228, 162]
}

const imageProvider = imageProviderImgProxyFactory({
  secret: process.env.NEXT_PUBLIC_IMAGE_RESIZE_SERVICE_SECRET as string,
  url: process.env.NEXT_PUBLIC_IMAGE_RESIZE_SERVICE_URL as string
})

export function HotelsList(props: ListProps) {
  return (
    <>
      {props.hotelIds.map((hotelId) => {
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
                        src={imageProvider(hotel.imageURIs?.[0], SIZES['gridPrimary'])}
                        alt={hotel.hotelName}
                        className="object-cover"
                        width={384}
                        height={192}
                        unoptimized
                      />
                    }
                  </div>
                  <div className="flex items-center space-x-1 pt-1">
                    {hotel.imageURIs?.slice(1,4).map((url, n) => (
                      <div key={n} className="h-14 bg-gray-200 dark:bg-gray-700 w-24">
                        <Image
                          src={imageProvider(url, SIZES['gridSecondary'])}
                          alt={hotel.hotelName}
                          className="object-cover"
                          width={96}
                          height={59}
                          unoptimized
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
                <div className="mb-3 text-xs">{hotel.placeDisplayName}</div> 
                <OffersList offerEntity={offerEntity} />
              </div>
            </div>
            <div className="border-b" />
          </div>
        )
      })}
    </>
  )
}

interface Props {
  initialResults: {
    hotelIds: string[]
    hotelEntities: Record<string, Hotel>
    offerEntities: Record<string, OfferEntity>
    hasMoreResults: boolean
  }
  searchParams: SearchParams
}

export function HotelsListContainer(props: Props) {
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
      <HotelsList
        isComplete={isComplete}
        hotelIds={hotelIds}
        hotelEntities={hotelEntities}
        offerEntities={offerEntities}
      />
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

/**
 * Loader
 */
export function HotelsListFallback() {
  return (
    <>
      {[1,2,3,4,5,6].map((i: number) => (
        <div key={i}>
          <div className="w-full my-5 flex max-w-full flex-col md:max-w-full md:flex-row md:items-start md:text-left">
            <div className="mb-4 md:mr-6 md:mb-0 md:w-96">
              <div className="rounded-lg overflow-hidden animate-pulse" role="status">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full" />
                <div className="flex items-center space-x-1 pt-1" >
                  {[1,2,3].map((i, n) => (
                    <div key={n} className="h-14 bg-gray-200 dark:bg-gray-700 w-24" />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full animate-pulse" role="status">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-2/12 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 w-7/12 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 w-4/12 mb-7" />
              {[1,2,3].map((i, n) => (
                <div key={n} className="h-9 bg-gray-200 dark:bg-gray-700 my-4 w-full" />
              ))}
            </div>
          </div>
          <div className="border-b" />
        </div>
      ))}
   </>
  )
}
