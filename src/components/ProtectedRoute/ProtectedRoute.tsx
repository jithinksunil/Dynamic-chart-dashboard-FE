import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context'
import { useRefreshToken } from '@/hooks'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { auth } = useAuth()
  const refresh = useRefreshToken()
  const location = useLocation()
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(!auth.accessToken)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(Boolean(auth.accessToken))

  useEffect((): (() => void) => {
    let isMounted = true

    const verifySession = async (): Promise<void> => {
      if (auth.accessToken) {
        if (isMounted) {
          setIsAuthorized(true)
          setIsCheckingAuth(false)
        }
        return
      }

      if (isMounted) {
        setIsCheckingAuth(true)
      }

      try {
        await refresh()
        if (isMounted) {
          setIsAuthorized(true)
        }
      } catch {
        if (isMounted) {
          setIsAuthorized(false)
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    void verifySession()

    return (): void => {
      isMounted = false
    }
  }, [auth.accessToken, refresh])

  if (isCheckingAuth) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground text-base font-medium">Restoring your session</p>
          <p className="text-muted-foreground mt-2 text-sm">
            We&apos;re checking your access and loading the dashboard.
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default ProtectedRoute
