import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

type PrimaryButtonProps = Omit<ComponentProps<typeof Button>, 'variant'>

function PrimaryButton(props: PrimaryButtonProps) {
  return <Button variant="default" {...props} />
}

export { PrimaryButton }
