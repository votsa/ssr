'use client'

import {OffersList} from '@/src/components/Offers'
import {SearchParams, Hotel, OfferEntity} from '@/src/app/search/types'
import {useAnchor} from '@/src/app/search/useAnchor'

import {HotelCard} from './HotelCard'

interface Props {
  hotel: Hotel
  offerEntity: OfferEntity
  searchParams: SearchParams
}

export function AnchorHotel(props: Props) {
  const {hotel, offerEntity, isComplete} = useAnchor(props)

  return (
    <HotelCard hotel={hotel}>
      <OffersList
        offerEntity={offerEntity}
        isComplete={isComplete}
        searchParams={props.searchParams}
      />
    </HotelCard>
  )
}
