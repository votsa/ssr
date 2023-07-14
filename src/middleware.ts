import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {v4 as uuidv4} from 'uuid'
 
export function middleware(request: NextRequest) {
  const anonymousId = request.cookies.get('anonymousId')
  const userCountryCode = request.cookies.get('userCountryCode')

  const response = NextResponse.next()

  if (typeof anonymousId === 'undefined') {
    response.cookies.set('anonymousId', uuidv4())
  }

  if (typeof userCountryCode === 'undefined') {
    const countryCode = request.geo?.country ?? 'US'
    response.cookies.set('userCountryCode', countryCode)
  }
 
  return response
}
