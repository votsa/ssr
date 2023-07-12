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
        <div key={i}>
          <div className="mx-auto w-full my-5 flex max-w-xs flex-col md:max-w-full md:flex-row md:items-start md:text-left">
            <div className="mb-4 md:mr-6 md:mb-0 md:w-96">
              <div className="rounded-lg overflow-hidden animate-pulse" role="status">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full" />
                <div className="flex items-center space-x-1 pt-1" >
                  {[1,2,3].map((i, n) => (
                    <div key={n} className="h-14 bg-gray-200 dark:bg-gray-700 w-24" />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full animate-pulse" role="status">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-2/12 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 w-7/12 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 w-4/12 mb-7" />
              {[1,2,3].map((i, n) => (
                <div key={n} className="h-7 bg-gray-200 dark:bg-gray-700 my-2 w-full" />
              ))}
            </div>
          </div>
          <div className="border-b" />
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
