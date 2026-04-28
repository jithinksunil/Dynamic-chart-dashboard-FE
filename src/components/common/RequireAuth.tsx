import { useAuth } from '@/context'
import { useRefreshToken } from '@/hooks'
import { toastMessage, type Roles } from '@/utility'
import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export const RequireAuth = ({ allowedRoles }: { allowedRoles?: Roles[] }) => {
  const { auth } = useAuth()
  const location = useLocation()
  const refresh = useRefreshToken()
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        if (auth.accessToken) return
        await refresh()
      } catch (err: unknown) {
        toastMessage.error({ err })
      } finally {
        setLoading(false)
      }
    }
    checkLoggedIn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  if (loading) return <p className="text-muted-foreground text-sm">Loading</p>
  if (!auth.accessToken) return <Navigate to="/" state={{ from: location }} replace />
  if (allowedRoles && !allowedRoles.includes(auth.role))
    return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
