import type {InferGetServerSidePropsType} from 'next'
import {useEffect, useState} from 'react'

import SearchResultsList from '@/src/components/SearchResultsList'

interface SearchParams {
  placeId: string
  checkIn: string
  checkOut: string
  rooms: string
}

const apiDomain = 'https://dikcjxfwieazv.cloudfront.net'

async function getResults(searchParams: SearchParams) {
  const {placeId, checkIn, checkOut, rooms = 2} = searchParams

  const res = await fetch(`${apiDomain}/search?offset=0&searchId=fe8848a8-a313-4a3c-8610-f3462573f5d6&profileId=findhotel-website&placeId=${placeId}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&currency=USD&language=en&variations=sapi4eva-match-clicked-offer-a%2Csapi4eva-sid-landing-unavailability-a%2Csapi4eva-room-mapping-rsp-v8-1-b%2Csapi4eva-check-price-v3-a%2Csapi4eva-hso-ctr-b%2Csapi4eva-dynamic-default-dates-v4-a%2Csapi4eva-load-anchor-separately-b%2Csapi4eva-imagedb-b%2Csapi4eva-price-range-a%2Csapi4eva-send-less-hotels-a%2Csapi4eva-room-merger-2-a%2Csapi4eva-own-place-hotel-mapping-2-a%2Csapi4eva-preheat-anchor-offers-b%2Csapi4eva-room-bundles-b%2Csapi4eva-price-range-v2-b%2Csapi4eva-address-search-a%2Csapi4eva-live-price-filter-a&attributes=facets%2ChotelEntities%2ChotelIds%2ChotelsHaveStaticPosition%2Coffset%2CresultsCount%2CresultsCountTotal%2CsearchParameters%2Clov%2CexchangeRates&anonymousId=6fe04e0d-962b-42b7-8020-1697184f7b87&cugDeals=signed_in%2Coffline%2Csensitive%2Cprime%2Cfsf&tier=plus&deviceType=desktop&brand=vio&label=utm_source%3Dfht&countryCode=NL&userId=eea8977b-87b3-4d42-bf46-14aea8a9926f&emailDomain=%40findhotel.net&screenshots=0`)
 
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
 
  return res.json()
}

async function getOffers(hoteIds: string[], searchParams: SearchParams) {
  const {checkIn, checkOut, rooms = 2} = searchParams

  const offersUrl = `${apiDomain}/offers?hotelIds=${hoteIds}&anonymousId=test&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&language=en&searchId=sapi.backend.test&currency=USD&brand=etrip&getAllOffers=false&random=12345&clientRequestId=foo-bar`

  const res = await fetch(offersUrl)
 
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
 
  return res.json()
}

export const getServerSideProps = async ({query}: {query: SearchParams}) => {
  const results = await getResults(query)

  return {props: {results, searchParams: query}}
}

export default function Find(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {results, searchParams} = props
  const [offers, setOffers] = useState([])

    useEffect(() => {
    async function fetchOffers() {
      const offers = await getOffers(results.hotelIds, searchParams)

      setOffers(offers.results)
    }

    fetchOffers()
  }, [setOffers, results, searchParams])

  return <SearchResultsList results={props.results} offers={offers} />
  
}
