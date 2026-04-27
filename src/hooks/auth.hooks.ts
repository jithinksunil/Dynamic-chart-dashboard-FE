import { useMutation } from '@tanstack/react-query'
import type { SignInRequest, SignUpRequest } from '../interfaces'
import { signIn, signUp, refresh } from '../requests'

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
