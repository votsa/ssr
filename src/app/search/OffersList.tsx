'use client'

import {OfferEntity} from './types'

interface Props {
  offerEntity?: OfferEntity
}

export default function OffersList({offerEntity}: Props) {
  if (!offerEntity) return null

   return (
    <>
      {offerEntity.offers.map((offer, n) => {
        const room = offerEntity.rooms[offer.roomID]
        return (
          <div key={offer.id}>
            {n > 0 && <div className="border-b" />}
            <a href={offer.url} target="_blank" className="flex py-4">
              <div className="w-20">{offer.providerCode}</div>
              <div className="flex-1 text-xs">{room?.name}</div>
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
