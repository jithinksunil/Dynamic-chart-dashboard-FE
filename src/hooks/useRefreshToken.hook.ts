import { useCallback } from 'react'
import { useAuth } from '../context'
import { useRefreshMutation } from './auth.hooks'

export const useRefreshToken = () => {
  const { setAuth } = useAuth()
  const { mutateAsync } = useRefreshMutation()

  const refresh = useCallback(async (): Promise<string> => {
    const data = await mutateAsync()
    setAuth({ accessToken: data.accessToken, role: data.role })
    return data.accessToken
  }, [mutateAsync, setAuth])

  return refresh
}
