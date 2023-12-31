'use client'

import {ReactNode} from 'react'
import Image from 'next/image'

import {getImageProvider, SIZES} from '@/src/app/utils'
import {Hotel} from '@/src/app/search/types'

interface Props {
  hotel: Hotel
  children: ReactNode
}

export function HotelCard({hotel, children}: Props) {
  const imageProvider = getImageProvider()

  return (
    <div className="mx-auto w-full p-3 flex max-w-full flex-col md:max-w-full md:flex-row md:items-start md:text-left">
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
        {children}
      </div>
    </div>
  )
}
