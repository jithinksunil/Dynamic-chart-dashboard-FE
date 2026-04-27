import type { ComponentProps } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface TextInputProps<T extends FieldValues> extends Omit<
  ComponentProps<'input'>,
  'name' | 'defaultValue'
> {
  control: Control<T>
  name: FieldPath<T>
  label: string
}

function TextInput<T extends FieldValues>({
  control,
  name,
  label,
  className,
  ...inputProps
}: TextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            aria-invalid={!!fieldState.error}
            className={cn(fieldState.error && 'border-destructive', className)}
            {...inputProps}
            {...field}
            value={field.value ?? ''}
          />
          {fieldState.error?.message && (
            <p className="text-destructive text-sm">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

export { TextInput }
