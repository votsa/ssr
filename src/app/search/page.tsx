import {Metadata} from 'next'
import Image from 'next/image'

import {Suspense} from 'react'
import {v4 as uuidv4} from 'uuid'

import {AnchorHotel, HotelsList, HotelsListFallback} from '@/src/components/Hotel'
import {SearchForm} from '@/src/components/SearchForm'
import {getImageProvider, SIZES} from '@/src/app/utils'

import {useServerSideSearch} from './hooks/useServerSideSearch'
import {getAnchor, requestToSearchParams} from './apis'
import UserProvider from './UserProvider'
import {OfferEntity, SearchParams, AnchorResponse, UserRequestParams, SearchResults} from './types'
import {getUser} from './user'

interface Props {
  searchParams: UserRequestParams
}

/**
 * Set dynamic metadata
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchId = uuidv4()
  const searchParams = requestToSearchParams(props.searchParams, searchId)
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

interface AnchorProps {
  searchParams: SearchParams
  anchorData: Promise<AnchorResponse>
  anchorAvailabilityData: Promise<{results: OfferEntity[]}>
}

/**
 * Anchor hotel
 */
async function Anchor({
  anchorData,
  anchorAvailabilityData,
  searchParams
}: AnchorProps) {
  const [anchorResponse, anchorAvailability] = await Promise.all([anchorData, anchorAvailabilityData])
  const anchorHotel = anchorResponse?.hotelEntities?.[searchParams.hotelId as string]

  return (
    <>
      {anchorHotel && (
        <div className="mt-6">
          <div className="border border-blue-500 rounded-xl">
            <AnchorHotel
              hotel={anchorHotel}
              offerEntity={anchorAvailability.results?.[0]}
              searchParams={searchParams}
            />
          </div>
          <div className="text-xl mx-3 mt-8 font-normal">Great deals available</div>
        </div>
      )}
    </>
  )
}

interface SearchResultsProps {
  searchParams: SearchParams
  searchResultsData: Promise<SearchResults>
}

/**
 * Search results
 */
async function Search({
  searchResultsData,
  searchParams
}: SearchResultsProps) {
  const results = await searchResultsData

  if (!results || !results.hotelIds.length) return <div className="text-lg text-center">No results found</div>

  return (
    <HotelsList initialResults={results} searchParams={searchParams} />
  )
}

interface NavBarProps {
  searchParams: SearchParams
  anchorData: Promise<AnchorResponse>
}

async function NavBarSearchForm(props: NavBarProps) {
  const anchorResponse = await props.anchorData
  const {anchor} = anchorResponse
  const destination = anchor.hotelName ?? anchor.placeDisplayName

  return (
    <SearchForm destination={destination} searchParams={props.searchParams} />
  )
}

function NavBarSearchFormFallback() {
  return (
    <div className="w-[680px] animate-pulse" role="status">
      <div className="h-11 bg-gray-200 dark:bg-gray-700 w-full" />
    </div>
  )
}

/**
 * Search page loader
 */
export default function Page(props: Props) {
  const {
    searchId,
    anchorData,
    anchorAvailabilityData,
    searchResultsData,
    searchParams
} = useServerSideSearch(props.searchParams)

  return (
    <>
      <UserProvider user={getUser()}>
        <nav className="px-7 py-6 border-b sticky top-0 bg-white z-50">
          <div className="grid grid-flow-col justify-stretch">
            <div className="w-32 flex items-center">
              <Image
                src="https://www.vio.com/static/media/vio-logo.142636e625a9ec9028fe.svg"
                alt="vio.com"
                width={120}
                height={26}
                unoptimized
              />
            </div>
            <div className="flex items-center justify-center">
              <Suspense key={`form-${searchId}`} fallback={<NavBarSearchFormFallback />}>
                <NavBarSearchForm
                  searchParams={searchParams}
                  anchorData={anchorData}
                />
              </Suspense>
            </div>
            <div className="w-32 flex items-center" />
          </div>
        </nav>
        <div className="container mx-auto max-w-5xl">
          <main className="flex min-h-screen flex-col items-left p-3">
            {searchParams.hotelId && (
              <Suspense
                key={`anchor-${searchId}`}
                fallback={<div className="border border-blue-500 rounded-xl mt-6"><HotelsListFallback items={1} /></div>}
              >
                <Anchor
                  anchorData={anchorData}
                  anchorAvailabilityData={anchorAvailabilityData as Promise<{results: OfferEntity[]}>}
                  searchParams={searchParams}
                />
              </Suspense>
            )}
            <Suspense
              key={`search-${searchId}`}
              fallback={<HotelsListFallback />}
            >
              <Search
                searchParams={searchParams}
                searchResultsData={searchResultsData}
              />
            </Suspense>
          </main>
        </div>
      </UserProvider>
    </>
  )
}
