import { NextResponse } from 'next/server'
import {getResultsWithAvailability} from '../apis'
import { SearchParams } from '../types'
 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const params = {
    ...Object.fromEntries(new URLSearchParams(searchParams)),
    searchId: 'rand'
  } as unknown as SearchParams

  const results = await getResultsWithAvailability(params)

  return NextResponse.json({ ...results })
}
