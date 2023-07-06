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

        //if (props.isComplete && !offerEntity?.offers.length) return null

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
                  <div>
                    <div className="text-xs py-3">Loading...</div>
                    <div className="text-xs py-3">Loading...</div>
                    <div className="text-xs py-3">Loading...</div>
                  </div>
                )}
                {props.isComplete && offerEntity?.offers.length && <OffersList offerEntity={offerEntity} />}
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
  const {offers, isComplete} = useOffers(hotelIdsPages[0], props.searchParams)

  const hotelIds = hotelIdsPages.flatMap(i => i)

  return <HotelsList isComplete={isComplete} hotelIds={hotelIds} hotelEntities={hotelEntities} offers={offers} />
}
