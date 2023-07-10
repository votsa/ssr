'use client'

import Image from 'next/image'
import {useState} from 'react'

import {SearchParams, Hotel, OfferEntity} from './types'
import OffersList from './OffersList'
import {useOffers} from './useOffers'


interface ListProps {
  hotelEntities: Record<string, Hotel>
  hotelIds: string[]
  offers: OfferEntity[]
  isComplete: boolean
}

export function HotelsList(props: ListProps) {
  return (
    <>
      {props.hotelIds.map(hotelId => {
        const hotel = props.hotelEntities[hotelId]
        const offerEntity = props.offers?.find(res => res.id === hotel.objectID)

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
                <h3 className="text-lg">{hotel.hotelName}</h3>
                <div className="text-xs">{hotel.placeDisplayName}</div>
                {!props.isComplete && !offerEntity?.offers.length && (
                  <div role="status" className="max-w-sm animate-pulse">
                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4" />
                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5" />
                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5" />
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



interface ContainerProps {
  initialResults:  Record<string, any>
  searchParams: SearchParams
}

export default function HotelsListContainer(props: ContainerProps) {
  const [hotelIdsPages, setHotelIdsPages] = useState([props.initialResults.hotelIds])
  const [hotelEntities, setHotelEntities] = useState({...props.initialResults.hotelEntities ?? {}})
  const {offers, isComplete} = useOffers(hotelIdsPages[0], props.searchParams, props.initialResults.offerEntities)

  const hotelIds = hotelIdsPages.flatMap(i => i)

  return (
    <HotelsList
      isComplete={isComplete}
      hotelIds={hotelIds}
      hotelEntities={hotelEntities}
      offers={offers}
    />
  )
}
