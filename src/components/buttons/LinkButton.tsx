import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const linkButtonClassName =
  'text-primary hover:text-primary/80 font-medium transition-colors underline-offset-4 hover:underline cursor-pointer bg-transparent border-0 p-0'

type LinkButtonAsLinkProps = { to: string; onClick?: never } & Omit<
  ComponentProps<typeof Link>,
  'to' | 'className' | 'children'
> & { className?: string; children: ReactNode }

type LinkButtonAsButtonProps = { to?: never } & Omit<
  ComponentProps<'button'>,
  'className' | 'children'
> & { className?: string; children: ReactNode }

type LinkButtonProps = LinkButtonAsLinkProps | LinkButtonAsButtonProps

function LinkButton({ className, children, ...props }: LinkButtonProps) {
  if ('to' in props && props.to !== undefined) {
    const { to, ...rest } = props
    return (
      <Link to={to} className={cn(linkButtonClassName, className)} {...rest}>
        {children}
      </Link>
    )
  }

  const { type = 'button', ...rest } = props as LinkButtonAsButtonProps
  return (
    <button type={type} className={cn(linkButtonClassName, className)} {...rest}>
      {children}
    </button>
  )
}

export { LinkButton }
