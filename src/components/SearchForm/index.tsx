'use client'

import {useRef, useCallback} from 'react'

import {SearchParams} from '@/src/app/search/types'

interface Props {
  destination: string
  searchParams: SearchParams
}

export async function SearchForm({
  searchParams,
  destination
}: Props) {
  const form = useRef(null)

  const onCheckboxChange = useCallback(() => {
    //console.log(form)
    form.current?.submit()
  }, [])

  return (
    <form ref={form}>
      <div className="flex">
        <input className="border p-2 rounded mx-1 w-32" type="text" defaultValue={destination} readOnly />
        {!!searchParams.hotelId && <input className="border p-2 rounded mx-1 w-32" type="text" name="hotelId" defaultValue={searchParams.hotelId} />}
        {!!searchParams.placeId && <input className="border p-2 rounded mx-1 w-32" type="text" name="placeId" defaultValue={searchParams.placeId} />}
        <input className="border p-2 rounded mx-1 w-32" type="text" name="checkIn" defaultValue={searchParams.checkIn} />
        <input className="border p-2 rounded mx-1 w-32" type="text" name="checkOut" defaultValue={searchParams.checkOut} />
        <input className="border p-2 rounded mx-1 w-16" type="text" name="rooms" defaultValue={searchParams.rooms} />
        <button type="submit" className="p-2 bg-blue-600 rounded text-white">Search</button>
      </div>
      <div className="text-xs p-2">
        <span className="mr-2">Hotel star class:</span>
        {[1,2,3,4,5].map((i) => (
          <span key={i}>
            <input onChange={onCheckboxChange} type="checkbox" value={i} id="starRatings" name="starRatings" defaultChecked={searchParams.starRatings?.includes(i)} />
            <label htmlFor="starRatings">{i}</label>
          </span>
        ))}
      </div>
    </form>
  )
}
