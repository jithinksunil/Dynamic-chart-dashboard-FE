import { type ReactNode, useState } from 'react'
import type { AuthObject } from '../interfaces'
import { Roles } from '../utility'
import { AuthContext } from './authContext'

interface PropTypes {
  children: ReactNode
}

export const AuthProvider = (props: PropTypes) => {
  const [auth, setAuth] = useState<AuthObject>({
    accessToken: '',
    role: Roles.USER,
  })

  return <AuthContext.Provider value={{ auth, setAuth }}>{props.children}</AuthContext.Provider>
}
