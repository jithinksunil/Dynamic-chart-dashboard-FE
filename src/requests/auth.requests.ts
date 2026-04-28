import type { AxiosInstance, AxiosResponse } from 'axios'
import { axiosPublic } from '../api'
import type {
  SignInRequest,
  SignOutResponse,
  SignUpRequest,
  SigninResponse,
  MeResponse,
} from '../interfaces'

export const signIn = ({ data }: { data: SignInRequest }): Promise<AxiosResponse<SigninResponse>> =>
  axiosPublic.post<SigninResponse>('/auth/sign-in', data)

export const signUp = ({ data }: { data: SignUpRequest }): Promise<AxiosResponse<SigninResponse>> =>
  axiosPublic.post<SigninResponse>('/auth/sign-up', data)

export const refresh = (): Promise<AxiosResponse<SigninResponse>> =>
  axiosPublic.post<SigninResponse>('/auth/refresh')

export const signOut = ({
  axios,
}: {
  axios: AxiosInstance
}): Promise<AxiosResponse<SignOutResponse>> => axios.post<SignOutResponse>('/auth/sign-out')

export const getMe = ({ axios }: { axios: AxiosInstance }): Promise<AxiosResponse<MeResponse>> =>
  axios.get<MeResponse>('/auth/me')
