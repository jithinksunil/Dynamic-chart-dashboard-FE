import type { Dispatch, SetStateAction } from 'react'
import type { Roles } from '../utility'

export interface TokenResponse {
  accessToken: string
}

export interface AuthContextValue {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
}

export interface AuthObject {
  accessToken: string
  role: Roles
}

export interface Auth {
  auth: AuthObject
  setAuth: Dispatch<SetStateAction<AuthObject>>
}

export interface SigninResponse {
  accessToken: string
  role: Roles
}
