import {cookies} from 'next/headers'

export interface User {
  anonymousId: string
  countryCode: string
}

let user: User

export function getUser() {
  if (typeof user === 'undefined') {
    const cookieStore = cookies()
    const anonymousId = cookieStore.get('anonymousId') as {value: string}
    const countryCode = cookieStore.get('userCountryCode') as {value: string}

    user = {
      anonymousId: anonymousId.value,
      countryCode: countryCode.value
    }
  }

  return user
}
