import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

type SecondaryButtonProps = Omit<ComponentProps<typeof Button>, 'variant'>

function SecondaryButton(props: SecondaryButtonProps) {
  return <Button variant="secondary" {...props} />
}

export { SecondaryButton }
