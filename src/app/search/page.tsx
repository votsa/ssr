import { Metadata } from 'next';

import {Suspense} from 'react'
import {v4 as uuidv4} from 'uuid'

import {HotelsListContainer, HotelsListFallback} from './HotelsList'
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
 * Search page
 */
async function SearchPage(props: Props) {
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
      <Suspense fallback={<HotelsListFallback />}>
        <SearchPage searchParams={props.searchParams} />
      </Suspense>
    </main>
  )
}
