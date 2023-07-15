'use client'

import {SearchParams} from '@/src/app/search/types'

interface Props {
  searchParams: SearchParams
}

export function SearchForm(props: Props) {
  console.log('props', props)
  return (
    <form>
      <input className="border p-2 rounded mx-1 w-32" type="text" name="hotelId" defaultValue={props.searchParams.hotelId} />
      <input className="border p-2 rounded mx-1 w-32" type="text" name="checkIn" defaultValue={props.searchParams.checkIn} />
      <input className="border p-2 rounded mx-1 w-32" type="text" name="checkOut" defaultValue={props.searchParams.checkOut} />
      <input className="border p-2 rounded mx-1 w-16" type="text" name="rooms" defaultValue={props.searchParams.rooms} />
      <button type="submit" className="p-2 bg-blue-600 rounded text-white">Search</button>
    </form>
  )
}
