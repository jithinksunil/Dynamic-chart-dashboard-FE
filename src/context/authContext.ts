import { createContext } from 'react'
import type { Auth } from '../interfaces'
import { Roles } from '../utility'

const authDefaultValues: Auth = {
  auth: {
    accessToken: '',
    role: Roles.USER,
  },
  setAuth: () => {},
}

export const AuthContext = createContext(authDefaultValues)
