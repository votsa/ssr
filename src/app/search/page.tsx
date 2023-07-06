import {Suspense} from 'react'
import HotelsListContainer, {HotelsList} from './HotelsList'
import {getSearchResults, getOffers, availabilitySearch, AvailabilityParams} from './api'
import {SearchParams, OfferEntity} from './types'

interface Props {
  searchParams: SearchParams
}

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
  const staticResults1 = getSearchResults(searchParams)
  const staticResults2 = getSearchResults({...searchParams, offset: 40})
  const staticResults3 = getSearchResults({...searchParams, offset: 80})
  const staticResults4 = getSearchResults({...searchParams, offset: 120})
  const staticResults5 = getSearchResults({...searchParams, offset: 160})

  const [res1, res2, res3, res4, res5] = await Promise.all([
    staticResults1, staticResults2, staticResults3, staticResults4, staticResults5
  ])

  const hotelIds = [
    ...(res1?.hotelIds ?? []),
    ...(res2?.hotelIds ?? []),
    ...(res3?.hotelIds ?? []),
    ...(res4?.hotelIds ?? []),
    ...(res5?.hotelIds ?? [])
  ]

  const hotelEntities = {
    ...(res1?.hotelEntities ?? {}),
    ...(res2?.hotelEntities ?? {}),
    ...(res3?.hotelEntities ?? {}),
    ...(res4?.hotelEntities ?? {}),
    ...(res5?.hotelEntities ?? {}),
  }

  const availability = await getAvailability({
    hotelIds: hotelIds,
    ...searchParams
  }) as unknown as AvailabilityResponse

  const availableHotelIds = availability.results
    .filter((offerEntity) => offerEntity.offers.length !== 0)
    .map((offerEntity) => offerEntity.id)
    .slice(0, 20)

  const offerEntities = availability.results?.filter((offerEntity) => availableHotelIds.includes(offerEntity.id))

  return {
    hotelEntities,
    offerEntities,
    hotelIds: availableHotelIds
  }
}

async function SearchResults(props: Props) {
  const results = await getResultsWithAvailability(props.searchParams)

  if (!results) return <p>No results</p>

  return (
    <HotelsListContainer initialResults={results} searchParams={props.searchParams} />
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
            <div className="h-44 w-60 border">
              Loading...
            </div>
            <div className="col-span-3">
              <h3 className="text-lg">Loading...</h3>
              <div className="text-xs">Loading...</div>
              <div className="text-xs py-3">Loading...</div>
              <div className="text-xs py-3">Loading...</div>
              <div className="text-xs py-3">Loading...</div>
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
