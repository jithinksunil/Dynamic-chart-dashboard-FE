import type { ComponentProps } from 'react'
import type { FieldValues } from 'react-hook-form'
import { TextInput } from './TextInput'

type EmailInputProps<T extends FieldValues> = Omit<ComponentProps<typeof TextInput<T>>, 'type'>

function EmailInput<T extends FieldValues>(props: EmailInputProps<T>) {
  return <TextInput<T> type="email" autoComplete="email" {...props} />
}

export { EmailInput }
