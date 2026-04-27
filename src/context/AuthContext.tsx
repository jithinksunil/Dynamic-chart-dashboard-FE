import { type ReactNode, createContext, useState } from 'react'
import { useContext } from 'react'
import type { Auth, AuthObject } from '../interfaces'
import { Roles } from '../utility'

const authDefaultValues: Auth = {
  auth: {
    accessToken: '',
    role: Roles.USER,
  },
  setAuth: () => {},
}

const AuthContext = createContext(authDefaultValues)

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

export const useAuth = () => useContext(AuthContext)
