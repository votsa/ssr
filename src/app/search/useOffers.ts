'use client'

import {useEffect, useState} from 'react'
import {getOffers} from './api'
import {SearchParams} from './types'
import {OfferEntity} from './types'

export function useOffers(hotelIds: string[], searchParams: SearchParams, initialOfferEntities: OfferEntity[] = []) {
  const [offers, setOffers] = useState<OfferEntity[]>(initialOfferEntities)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    async function fetchOffers() {
      setIsComplete(false)

      const offers = await getOffers(hotelIds, searchParams)

      setOffers((existingOffers) => {
        //return [...existingOffers, ...offers.results]
        return offers.results
      })

      setIsComplete(true)
    }

    fetchOffers()
  }, [hotelIds, setOffers, searchParams])

  return {
    offers,
    isComplete
  }
}
