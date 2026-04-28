import { useMutation, useQuery } from '@tanstack/react-query'
import type { SignInRequest, SignUpRequest } from '../interfaces'
import { signIn, signUp, refresh, signOut, getMe } from '../requests'
import useAxiosPrivate from './useAxiosPrivate.hook'

export const useSignIn = () => {
  return useMutation({
    mutationFn: async (data: SignInRequest) => {
      const response = await signIn({ data })
      return response.data
    },
  })
}

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpRequest) => {
      const response = await signUp({ data })
      return response.data
    },
  })
}

export const useRefreshMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await refresh()
      return response.data
    },
  })
}

export const useSignOut = () => {
  const axios = useAxiosPrivate()
  return useMutation({
    mutationFn: async () => {
      const response = await signOut({ axios })
      return response.data
    },
  })
}

export const useGetMe = (enabled = true) => {
  const axios = useAxiosPrivate()
  return useQuery({
    enabled,
    queryKey: ['me'],
    queryFn: async () => {
      const response = await getMe({ axios })
      return response.data
    },
  })
}
