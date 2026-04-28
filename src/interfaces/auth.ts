import type { Dispatch, SetStateAction } from 'react'
import type { Roles } from '../utility'

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

export interface SignInRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  name: string
  email: string
  password: string
}

export interface SignOutResponse {
  message: string
}

export interface MeResponse {
  id: string
  name: string
  email: string
  role: Roles
}
