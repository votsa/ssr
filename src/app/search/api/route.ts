import {NextResponse} from 'next/server'
import {requestToSearchParams, getResultsWithAvailability} from '../apis'
import {UserRequestParams} from '../types'

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url)
  const {
    searchId,
    ...rest
  } = Object.fromEntries(new URLSearchParams(searchParams)) 

  const searchParamsTransformed = requestToSearchParams((rest as unknown as UserRequestParams), searchId)

  const results = await getResultsWithAvailability(searchParamsTransformed)

  return NextResponse.json({ ...results })
}
