import {Suspense} from 'react'
import {v4 as uuidv4} from 'uuid'

import HotelsListContainer, {HotelsList} from './HotelsList'
import {getSearchResults, getOffers, availabilitySearch, AvailabilityParams} from './api'
import {SearchParams, OfferEntity, Hotel} from './types'

interface Props {
  searchParams: SearchParams
}

const CLIENT_PAGE_SIZE = 20

function getAvailability(params: AvailabilityParams) {
  let pollsCount = 0

  return new Promise((resolve) => {
    async function poll() {
      const response = await availabilitySearch(params)

      pollsCount++

      if (pollsCount >= 2 || response?.status.complete) {
        pollsCount = 0

        resolve(response)
      } else {
        setTimeout(() => {
          poll()
        }, 1000);
      }
    }

    poll()
  })
}

interface AvailabilityResponse {
  results: OfferEntity[]
}

async function getResultsWithAvailability(searchParams: SearchParams) {
  const staticResults = await getSearchResults({...searchParams, pageSize: 500}) ?? {}

  const availability = await getAvailability({
    hotelIds: staticResults.hotelIds,
    ...searchParams
  }) as unknown as AvailabilityResponse

  const availableHotelEntities: Record<string, Hotel> = {}

  const availableHotelIds = availability.results
    .filter((offerEntity) => offerEntity.offers.length !== 0)
    .map((offerEntity) => {
      availableHotelEntities[offerEntity.id] = staticResults.hotelEntities[offerEntity.id]

      return offerEntity.id
    })
    .slice(0, CLIENT_PAGE_SIZE)

  const offerEntities = availability.results?.filter(
    (offerEntity) => availableHotelIds.includes(offerEntity.id)
  )

  return {
    hotelEntities: staticResults.hotelEntities,
    offerEntities,
    hotelIds: availableHotelIds
  }
}

async function SearchResults(props: Props) {
    const searchParams = {
    ...props.searchParams,
    searchId: uuidv4()
  }

  const results = await getResultsWithAvailability(searchParams)

  if (!results) return <p>No results</p>

  return (
    <HotelsListContainer initialResults={results} searchParams={searchParams} />
  )
}

async function SearchResultsWithOffers(props: Props) {
  const results = await getSearchResults(props.searchParams)
  const offers = await getOffers(results.hotelIds, props.searchParams)

  if (!results) return <p>No results</p>

  return (
    <HotelsList
      hotelIds={results.hotelIds}
      hotelEntities={results.hotelEntities}
      offers={offers.results}
      isComplete={true}
    />
  )
}

function Fallback() {
  return (
    <>
      {[1,2,3,4,5,6].map((i: number) => (
        <div className="my-3 p-2 border" key={i}>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-44 w-60">
              <div role="status" className="animate-pulse">
                <div className="h-44 bg-gray-200 dark:bg-gray-700 w-full" />
                <span className="sr-only">Loading...</span>
              </div>
            </div>
            <div className="col-span-3">
              <div role="status" className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 w-6/12 mb-4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 w-4/12 mb-4" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 my-2 w-full" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 my-2 w-full" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 my-2 w-full" />
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      ))}
   </>
  )
}

export default function Search(props: Props) {
  return (
    <main className="flex min-h-screen flex-col items-left p-3">
      <Suspense fallback={<Fallback />}>
        {props.searchParams.useOffers === '1' && <SearchResultsWithOffers searchParams={props.searchParams} />}
        {props.searchParams.useOffers !== '1' && <SearchResults searchParams={props.searchParams} />}
      </Suspense>
    </main>
  )
}
