import {Metadata} from 'next';

import {Suspense} from 'react'
import {v4 as uuidv4} from 'uuid'

import {HotelsListContainer, HotelsListFallback, HotelCard} from './HotelsList'
import {AnchorHotel} from './AnchorHotel'
import {getAnchor, getResultsWithAvailability, requestToSearchParams, getAvailability} from './apis'
import {OfferEntity, SearchParams} from './types'

interface Props {
  searchParams: SearchParams
}

/**
 * Set dynamic metadata
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const anchorResponse = await getAnchor(searchParams) ?? {}
  const images:string[] = ['https://media.s-bol.com/Y5Emk8jpE0JM/q7xw29y/550x661.jpg']

  // if (anchorResponse.anchorHotelId && anchorResponse.hotelEntities?.[anchorResponse.anchorHotelId]?.imageURIs?.[0]) {
  //   images.push(anchorResponse.hotelEntities?.[anchorResponse.anchorHotelId]?.imageURIs?.[0])
  // }

  return {
    title: anchorResponse.anchor?.hotelName ?? anchorResponse.anchor?.placeName ?? 'Vio.com',
    description: anchorResponse.anchor?.placeDisplayName ?? anchorResponse.anchor?.placeADN,
    openGraph: {
      images
    },
  }
}

/**
 * Search page
 */
async function SearchResults(props: Props) {
  const searchId = uuidv4()

  const searchParams = requestToSearchParams(props.searchParams, searchId)

  const results = await getResultsWithAvailability(searchParams)

  if (!results || !results.hotelIds.length) return <div className="text-lg text-center">No results found</div>

  return (
    <HotelsListContainer initialResults={results} searchParams={searchParams} />
  )
}

async function Anchor(props: Props) {
  const searchId = uuidv4()
  const searchParams = requestToSearchParams(props.searchParams, searchId)
  const anchorResponse = await getAnchor(searchParams)
  const anchorHotel = anchorResponse?.hotelEntities?.[anchorResponse.anchorHotelId]

  let anchorAvailability: {results: OfferEntity[]} = {results: []}

  if (anchorHotel) {
    anchorAvailability = await getAvailability({
      hotelIds: [anchorHotel.objectID],
      ...props.searchParams,
      searchId
    }, 2)
  }

  return (
    <div>
      <div className="mx-3 my-3">
        <div className="text-sm">{anchorResponse.anchor.placeDisplayName} : {anchorResponse.searchParameters.checkIn} / {anchorResponse.searchParameters.checkOut}</div>
      </div>
      {anchorHotel && (
        <>
          <div className="border border-blue-500 rounded-xl">
            <AnchorHotel
              hotel={anchorHotel}
              offerEntity={anchorAvailability.results?.[0]}
              searchParams={props.searchParams}
            />
          </div>
          <div className="text-xl mx-3 mt-8 font-normal">Great deals available</div>
        </>
      )}
    </div>
  )
}

/**
 * Search page loader
 */
export default function SearchPageLoader(props: Props) {
  return (
    <main className="flex min-h-screen flex-col items-left p-3">
      <Suspense fallback={<HotelsListFallback />}>
        <Anchor searchParams={props.searchParams} />
      </Suspense>
      <Suspense fallback={<HotelsListFallback />}>
        <SearchResults searchParams={props.searchParams} />
      </Suspense>
    </main>
  )
}
