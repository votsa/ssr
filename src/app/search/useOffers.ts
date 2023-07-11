'use client'

import {useEffect, useState} from 'react'
import {getOffers} from './apis'
import {SearchParams} from './types'
import {OfferEntity} from './types'

export function useOffers(
  hotelIds: string[],
  initialOfferEntities: Record<string, OfferEntity>,
  searchParams: SearchParams
) {
  const [offerEntities, setOffers] = useState<Record<string, OfferEntity>>(initialOfferEntities)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    async function fetchOffers() {
      setIsComplete(false)

      const offers = await getOffers(hotelIds, searchParams)
      const offerEntities: Record<string, OfferEntity> = {}

      offers.results?.forEach((offerEntity) => {
        offerEntities[offerEntity.id] = offerEntity
      })

      setOffers((existingOfferEntities) => ({
        ...existingOfferEntities,
        ...offerEntities
      }))

      setIsComplete(true)
    }

    fetchOffers()
  }, [hotelIds, setOffers, searchParams])

  return {
    offerEntities,
    setOffers,
    isComplete,
    setIsComplete
  }
}
