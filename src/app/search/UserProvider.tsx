'use client'

import {createContext, ReactNode, useState, useEffect} from 'react'
import {User} from './user'

const userTemplate = {
  anonymousId: '',
  countryCode: 'US'
}

export const UserContext = createContext<User>(userTemplate)

export default function UserProvider(props: {user: User, children: ReactNode}) {
  const [user, setUser] = useState<User>(props.user)

  useEffect(() => {
    setUser(props.user)
  }, [setUser, props.user])

  return (
    <UserContext.Provider value={user}>
      {props.children}
    </UserContext.Provider>
  )
}
