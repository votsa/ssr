'use client'

import {OfferEntity} from './types'

interface Props {
  offerEntity?: OfferEntity
  isComplete: boolean
}

export default function OffersList({offerEntity, isComplete}: Props) {
  if (!offerEntity?.offers?.length && isComplete) {
    return (
      <div className="p-6 bg-yellow-100 text-sm w-auto inline-block">
        Unfortunately the hotel is unavailable at this moment
      </div>
    )
  }

   return (
    <>
      {offerEntity?.offers.map((offer, n) => {
        const room = offerEntity.rooms[offer.roomID]

        return (
          <div key={offer.id}>
            {n > 0 && <div className="border-b" />}
            <a href={offer.url} target="_blank" className="flex py-4 align-middle">
              <div className="w-20">{offer.providerCode}</div>
              <div className="flex-1">
                <span className="h-8 text-xs">{room?.name}</span>
              </div>
              <div className="text-right w-48">
                <span>{offer.rate?.base?.toFixed(0)}</span>
                <span className="mx-1">{offer.currency}</span>
                <span className="p-2 bg-blue-600 rounded text-white">View Deal</span>
              </div>
            </a>
          </div>
        )
      })}
    </>
  )
}
