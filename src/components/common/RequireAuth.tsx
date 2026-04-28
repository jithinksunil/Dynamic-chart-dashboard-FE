import { useAuth } from '@/context'
import type { Roles } from '@/utility'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export const RequireAuth = ({ allowedRoles }: { allowedRoles?: Roles[] }) => {
  const { auth } = useAuth()
  const location = useLocation()

  if (!auth.accessToken) return <Navigate to="/" state={{ from: location }} replace />
  if (allowedRoles && !allowedRoles.includes(auth.role))
    return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
;('')
