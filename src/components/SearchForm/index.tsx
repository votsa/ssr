'use client'

import {useSearchParams} from 'next/navigation'

export function SearchForm() {
  const searchParams = useSearchParams()

  return (
    <form>
      <input className="border p-2 rounded mx-1 w-32" type="text" name="hotelId" defaultValue={searchParams.get('hotelId') as string} />
      <input className="border p-2 rounded mx-1 w-32" type="text" name="checkIn" defaultValue={searchParams.get('checkIn') as string} />
      <input className="border p-2 rounded mx-1 w-32" type="text" name="checkOut" defaultValue={searchParams.get('checkOut') as string} />
      <input className="border p-2 rounded mx-1 w-16" type="text" name="rooms" defaultValue={searchParams.get('rooms') as string} />
      <button type="submit" className="p-2 bg-blue-600 rounded text-white">Search</button>
    </form>
  )
}
