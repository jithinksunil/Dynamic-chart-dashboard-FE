import { useCallback } from 'react'
import { useAuth } from '../context'
import { axiosPublic } from '../api'
import type { SigninResponse } from '../interfaces/auth'
import { toastMessage } from '../utility'

export const useRefreshToken = () => {
  const { setAuth } = useAuth()

  const refresh = useCallback(async (): Promise<string> => {
    try {
      const { data } = await axiosPublic.get<SigninResponse>(`/auth/refresh`, {
        withCredentials: true,
      })

      setAuth(() => ({
        role: data.role,
        accessToken: data.accessToken,
      }))

      return data.accessToken
    } catch (err: unknown) {
      toastMessage.error({ err })
      throw err
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return refresh
}
