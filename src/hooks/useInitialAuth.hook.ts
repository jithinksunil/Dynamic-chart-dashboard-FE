import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRefreshToken } from './useRefreshToken.hook'

export const useInitialAuth = () => {
  const navigate = useNavigate()
  const refresh = useRefreshToken()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        await refresh()
        navigate('/dashboard', { replace: true })
      } catch {
        // token refresh failed — user is not authenticated
      } finally {
        setLoading(false)
      }
    }
    checkLoggedIn()
  }, [refresh, navigate])

  return { isLoading: loading }
}
