'use client'

import {OfferEntity} from './types'

interface Props {
  offerEntity?: OfferEntity
}

export default function OffersList(props: Props) {
   return (
    <>
      {props.offerEntity?.offers.map((offer, n) => {
        return (
          <div key={offer.id}>
            {n > 0 && <div className="border-b" />}
            <div className="grid grid-cols-3 gap-3 py-4">
              <div className="col-span-2">{offer.providerCode}</div>
              <div className="text-right">
                {offer.rate?.base?.toFixed(0)} {offer.currency} <a href={offer.url} target="_blank" className="p-2 bg-blue-600 rounded text-white">View Deal</a>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
