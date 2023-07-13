'use client'

import {useState, useEffect} from 'react'

import {HotelCard} from './HotelsList'
import {SearchParams, Hotel, OfferEntity} from './types'
import {getOffers} from './apis'

interface Props {
  hotel: Hotel
  offerEntity: OfferEntity
  searchParams: SearchParams
}

const useAnchorHotel = (props: Props) => {
  const [isComplete, setIsComplete] = useState(false)
  const [hotel, setHotel] = useState(props.hotel)
  const [offerEntity, setOfferEntity] = useState(props.offerEntity)

  useEffect(() => {
    async function loadOffers() {
      setIsComplete(false)

      const offers = await getOffers([hotel.objectID], props.searchParams)

      setOfferEntity(offers.results?.[0])

      setIsComplete(true)
    }

    void loadOffers()
  }, [])

  return {
    isComplete,
    hotel,
    offerEntity
  }
}

export function AnchorHotel(props: Props) {
  const {hotel, offerEntity, isComplete} = useAnchorHotel(props)

  return (
    <HotelCard hotel={hotel} offerEntity={offerEntity} isComplete={isComplete} />
  )
}
