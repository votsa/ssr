import {v4 as uuidv4} from 'uuid'

import {getAnchor, getResultsWithAvailability, requestToSearchParams, getAvailability} from '../apis'
import {UserRequestParams} from '../types'

export function useServerSideSearch(userRequestParams: UserRequestParams) {
  const searchId = uuidv4()
  const searchParams = requestToSearchParams(userRequestParams, searchId)

  const anchorData = getAnchor(searchParams)
  const anchorAvailabilityData = searchParams.hotelId ? getAvailability({
    anchorHotelId: searchParams.hotelId,
    ...searchParams
  }, 1) : undefined

  const searchResultsData = getResultsWithAvailability(searchParams)

  return {
    searchId,
    anchorData,
    anchorAvailabilityData,
    searchResultsData,
    searchParams
  }
}
