import {Metadata} from 'next'

import {Suspense} from 'react'
import {v4 as uuidv4} from 'uuid'

import {AnchorHotel, HotelsList, HotelsListFallback} from '@/src/components/Hotel'
import {getImageProvider, SIZES} from '@/src/app/utils'
import {SearchForm} from '@/src/components/SearchForm'

import {getAnchor, getResultsWithAvailability, requestToSearchParams, getAvailability} from './apis'
import UserProvider from './UserProvider'
import {OfferEntity, SearchParams} from './types'
import {getUser} from './user'

interface Props {
  searchParams: SearchParams
}

/**
 * Set dynamic metadata
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const anchorResponse = await getAnchor(searchParams) ?? {}

  const images = []

  if (anchorResponse.anchorHotelId) {
    const imageProvider = getImageProvider()
    const anchorImage = anchorResponse.hotelEntities?.[anchorResponse.anchorHotelId]?.imageURIs?.[0]

    if (anchorImage) {
      images.push(
        imageProvider(anchorImage, SIZES['extraLarge'])
      )
    }
  }

  const title = anchorResponse.anchor?.hotelName ?? anchorResponse.anchor?.placeName ?? 'Vio.com'
  const description =  anchorResponse.anchor?.placeDisplayName ?? anchorResponse.anchor?.placeADN

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images
    }
  }
}

/**
 * Anchor hotel
 */
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
        <div className="text-sm">
          {anchorResponse.anchor.placeDisplayName} : {anchorResponse.searchParameters.checkIn} / {anchorResponse.searchParameters.checkOut}
        </div>
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
 * Search results
 */
async function Search(props: Props) {
  const searchId = uuidv4()

  const searchParams = requestToSearchParams(props.searchParams, searchId)

  const results = await getResultsWithAvailability(searchParams)

  if (!results || !results.hotelIds.length) return <div className="text-lg text-center">No results found</div>

  return (
    <HotelsList initialResults={results} searchParams={searchParams} />
  )
}

/**
 * Search page loader
 */
export default function PageLoader(props: Props) {
  return (
    <main className="flex min-h-screen flex-col items-left p-3">
      <SearchForm searchParams={props.searchParams} />

      <UserProvider user={getUser()}>
        <Suspense fallback={<HotelsListFallback items={1} />}>
          <Anchor searchParams={props.searchParams} />
        </Suspense>
        <Suspense fallback={<HotelsListFallback />}>
          <Search searchParams={props.searchParams} />
        </Suspense>
      </UserProvider>
    </main>
  )
}
