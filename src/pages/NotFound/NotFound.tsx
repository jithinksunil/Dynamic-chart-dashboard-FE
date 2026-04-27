import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-primary text-sm font-medium tracking-widest uppercase">404</p>
        <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/" className={buttonVariants()}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
