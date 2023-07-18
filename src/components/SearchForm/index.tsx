'use client'

import { SearchParams } from '@/src/app/search/types'

interface Props {
  destination: string
  searchParams: SearchParams
}

export async function SearchForm({
  searchParams,
  destination
}: Props) {
  return (
    <form>
      <input className="border p-2 rounded mx-1 w-32" type="text" defaultValue={destination} readOnly />
      {!!searchParams.hotelId && <input className="border p-2 rounded mx-1 w-32" type="text" name="hotelId" defaultValue={searchParams.hotelId} />}
      {!!searchParams.placeId && <input className="border p-2 rounded mx-1 w-32" type="text" name="placeId" defaultValue={searchParams.placeId} />}
      <input className="border p-2 rounded mx-1 w-32" type="text" name="checkIn" defaultValue={searchParams.checkIn} />
      <input className="border p-2 rounded mx-1 w-32" type="text" name="checkOut" defaultValue={searchParams.checkOut} />
      <input className="border p-2 rounded mx-1 w-16" type="text" name="rooms" defaultValue={searchParams.rooms} />
      <button type="submit" className="p-2 bg-blue-600 rounded text-white">Search</button>
    </form>
  )
}
