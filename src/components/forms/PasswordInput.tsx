import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PasswordInputProps<T extends FieldValues> extends Omit<
  ComponentProps<'input'>,
  'type' | 'name' | 'defaultValue'
> {
  control: Control<T>
  name: FieldPath<T>
  label: string
}

function PasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  className,
  ...inputProps
}: PasswordInputProps<T>) {
  const [visible, setVisible] = useState(false)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={name}>{label}</Label>
          <div className="relative">
            <Input
              id={name}
              type={visible ? 'text' : 'password'}
              aria-invalid={!!fieldState.error}
              autoComplete="current-password"
              className={cn('pr-10', fieldState.error && 'border-destructive', className)}
              {...inputProps}
              {...field}
              value={field.value ?? ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={visible ? 'Hide password' : 'Show password'}
              className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? (
                <EyeOff className="text-muted-foreground h-4 w-4" />
              ) : (
                <Eye className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
          {fieldState.error?.message && (
            <p className="text-destructive text-sm">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

export { PasswordInput }
