import { Metadata } from 'next';

import {Suspense} from 'react'
import {v4 as uuidv4} from 'uuid'

import HotelsListContainer from './HotelsList'
import {getSearchResults, getResultsWithAvailability, requestToSearchParams} from './apis'
import {SearchParams} from './types'

interface Props {
  searchParams: SearchParams
}

/**
 * Set dynamic metadata
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const staticResults = await getSearchResults({...searchParams, attributes: 'anchor'}) ?? {}

  return {
    title: staticResults.anchor?.placeName,
    description: staticResults.anchor?.placeADN,
  }
}

/**
 * Loader
 */
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

async function SearchResults(props: Props) {
  const searchId = uuidv4()

  const searchParams = requestToSearchParams(props.searchParams, searchId)

  const results = await getResultsWithAvailability(searchParams)

  if (!results || !results.hotelIds.length) return <div className="text-lg text-center">No results found</div>

  return (
    <HotelsListContainer initialResults={results} searchParams={searchParams} />
  )
}

/**
 * Search page loader
 */
export default function SearchPageLoader(props: Props) {
  return (
    <main className="flex min-h-screen flex-col items-left p-3">
      <Suspense fallback={<Fallback />}>
        <SearchResults searchParams={props.searchParams} />
      </Suspense>
    </main>
  )
}
