import type { ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { PrimaryButton, SecondaryButton } from '@/components/buttons'

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          An unexpected error occurred. Try again, or reload the page.
        </p>
        {error instanceof Error && error.message && (
          <pre className="bg-muted text-muted-foreground mt-4 max-h-40 overflow-auto rounded-md p-3 text-left text-xs">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <SecondaryButton onClick={resetErrorBoundary}>Try again</SecondaryButton>
          <PrimaryButton onClick={() => window.location.reload()}>Reload page</PrimaryButton>
        </div>
      </div>
    </div>
  )
}

function ErrorBoundary({ children }: { children: ReactNode }) {
  return <ReactErrorBoundary FallbackComponent={Fallback}>{children}</ReactErrorBoundary>
}

export default ErrorBoundary
