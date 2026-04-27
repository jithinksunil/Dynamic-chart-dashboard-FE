import type { AxiosResponse } from 'axios'
import { axiosPublic } from '../api'
import type { SignInRequest, SignUpRequest, SigninResponse } from '../interfaces'

export const signIn = ({ data }: { data: SignInRequest }): Promise<AxiosResponse<SigninResponse>> =>
  axiosPublic.post<SigninResponse>('/auth/sign-in', data)

export const signUp = ({ data }: { data: SignUpRequest }): Promise<AxiosResponse<SigninResponse>> =>
  axiosPublic.post<SigninResponse>('/auth/sign-up', data)

export const refresh = (): Promise<AxiosResponse<SigninResponse>> =>
  axiosPublic.post<SigninResponse>('/auth/refresh')
