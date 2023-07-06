import Image from 'next/image'

interface Offer {
  id: string
  url: string
  providerCode: string
  currency: string
  rate: {
    base: number
  }
}

interface OfferEntity {
  id: string
  offers: Offer[]
}

interface Props {
  results: Record<string, any>
  offers?: OfferEntity[]
}

function SearchResultsList(props: Props) {
  const {results, offers} = props

  if (!results) return <p>No results</p>

  return (
    <div>
      {results.hotelIds.map((id: string) => {
        const hotel = results.hotelEntities[id]
        const hotelOffers = offers?.find(res => res.id === hotel.objectID)

        //if (!hotelOffers?.offers.length) return null

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
                    priority
                  />
                }
              </div>
              <div className="col-span-3">
                <h3 className="text-lg">{hotel.hotelName}</h3>
                <div className="text-xs">{hotel.placeDisplayName}</div>
                <div>
                  {hotelOffers?.offers.map(offer => {
                    return (
                      <div key={offer.id} className="grid grid-cols-3 gap-3 py-2">
                        <div className="col-span-2">{offer.providerCode}</div>
                        <div className="text-right">
                          {offer.rate?.base?.toFixed(0)} ${offer.currency} <a href={offer.url} target="_blank" className="p-2 bg-blue-600 rounded text-white">View Deal</a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SearchResultsList
