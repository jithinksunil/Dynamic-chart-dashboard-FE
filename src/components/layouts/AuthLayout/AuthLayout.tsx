import type { ReactNode } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { useInitialAuth } from '@/hooks'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isLoading } = useInitialAuth()

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border">
            <LayoutDashboard className="text-primary h-6 w-6" />
          </div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Dynamic Dashboard
          </h1>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground text-center text-sm">Loading...</p>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
