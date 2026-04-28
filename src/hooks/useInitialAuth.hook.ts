import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context'
import { useRefreshMutation } from './auth.hooks'

export const useInitialAuth = () => {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useRefreshMutation()

  useEffect(() => {
    mutateAsync()
      .then((data) => {
        setAuth({ accessToken: data.accessToken, role: data.role })
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {})
  }, [mutateAsync, navigate, setAuth])

  return { isChecking: isPending }
}
