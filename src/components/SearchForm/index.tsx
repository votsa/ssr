'use client'

import {useRouter, usePathname} from 'next/navigation'

import {FormEvent, useRef, useCallback, useState} from 'react'

import {SearchParams} from '@/src/app/search/types'

interface Props {
  destination: string
  searchParams: SearchParams
}

function useSearchForm(searchParams: SearchParams, destination: string) {
  const [formParams, setFormParams] = useState(searchParams)
  const router = useRouter()
  const pathname = usePathname()

  const submitForm = useCallback((searchParams: SearchParams) => {
    const {starRatings, offset, searchId, ...rest} = searchParams

    const params = new URLSearchParams(rest as unknown as Record<string, string>)

    starRatings?.forEach((rating) => {
      params.append('starRatings', rating.toString())
    })

    const newParams = params.toString()

    router.push(`${pathname}?${newParams}`)
  }, [router, pathname])

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    submitForm(formParams)
  }, [formParams, submitForm])

  const handleStarRatingsChange = useCallback((i: number) => () => {
    const set = new Set(formParams.starRatings)

    if (set.has(i)) {
      set.delete(i)
    } else {
      set.add(i)
    }

    submitForm({
      ...formParams,
      starRatings: [...new Set(set)]
    })
  }, [formParams, submitForm])

  const handleInputChange = useCallback((e: FormEvent<HTMLInputElement>) => {
    const {name, value} = e.currentTarget

    setFormParams((params) => {
      return {
        ...params,
        [name]: value
      }
    })
  }, [setFormParams])

  return {
    formParams,
    onStarRatingsChange: handleStarRatingsChange,
    onInputChange: handleInputChange,
    onSubmit: handleSubmit
  }
}

export function SearchForm({
  searchParams,
  destination
}: Props) {
  const {
    onStarRatingsChange,
    onInputChange,
    onSubmit,
    formParams
  } = useSearchForm(searchParams, destination)

  return (
    <form onSubmit={onSubmit}>
      <div className="flex">
        <input
          className="border p-2 rounded mx-1 w-32"
          type="text"
          defaultValue={destination}
          readOnly
        />
        {!!searchParams.hotelId && 
          <input
            className="border p-2 rounded mx-1 w-32"
            type="text"
            name="hotelId"
            value={formParams.hotelId}
            onChange={onInputChange}
          />
        }
        {!!searchParams.placeId &&
          <input
            className="border p-2 rounded mx-1 w-32"
            type="text"
            name="placeId"
            value={formParams.placeId} 
            onChange={onInputChange}
          />
        }
        <input
          className="border p-2 rounded mx-1 w-32"
          type="text"
          name="checkIn"
          value={formParams.checkIn} 
          onChange={onInputChange}
        />
        <input
          className="border p-2 rounded mx-1 w-32"
          type="text"
          name="checkOut"
          value={formParams.checkOut} 
          onChange={onInputChange}
        />
        <input
          className="border p-2 rounded mx-1 w-16"
          type="text"
          name="rooms"
          value={formParams.rooms} 
          onChange={onInputChange}
        />
        <button type="submit" className="p-2 bg-blue-600 rounded text-white">
          Search
        </button>
      </div>
      <div className="text-xs p-2">
        <div className="flex items-center">
          <span className="mr-2 ">Hotel star class:</span>
          {[1,2,3,4,5].map((i, n) => (
            <span key={n} onClick={onStarRatingsChange(i)}>
              <svg
                className={`w-5 h-5  hover:text-yellow-500 hover:cursor-pointer ${formParams.starRatings?.includes(i) ? 'text-yellow-600' : 'text-yellow-400'}`}
                aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </form>
  )
}
