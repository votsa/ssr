'use client'

import {useState, useEffect, useContext} from 'react'

import {SearchParams, Hotel, OfferEntity} from './types'
import {getOffers} from './clientApi'
import {UserContext} from './UserProvider'

interface Props {
  hotel: Hotel
  offerEntity: OfferEntity
  searchParams: SearchParams
}

export const useAnchor = (props: Props) => {
  const user = useContext(UserContext)
  const [isComplete, setIsComplete] = useState(false)
  const [hotel, setHotel] = useState(props.hotel)
  const [offerEntity, setOfferEntity] = useState(props.offerEntity)

  useEffect(() => {
    async function loadOffers() {
      setIsComplete(false)

      const offersResponse = await getOffers([hotel.objectID], props.searchParams, user)

      setOfferEntity(offersResponse.offerEntities[hotel.objectID])

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
