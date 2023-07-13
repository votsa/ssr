import {useState, useEffect} from 'react'

import {SearchParams, Hotel, OfferEntity} from './types'
import {getOffers} from './apis'

interface Props {
  hotel: Hotel
  offerEntity: OfferEntity
  searchParams: SearchParams
}

export const useAnchor = (props: Props) => {
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
