import { useRef, useState } from 'react'
import type { DragEvent, MouseEvent } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FileInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  allowedTypes: string[]
  className?: string
}

function FileInput<T extends FieldValues>({
  control,
  name,
  label,
  allowedTypes,
  className,
}: FileInputProps<T>) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = allowedTypes.join(',')

  const isAllowed = ({ file }: { file: File }): boolean => {
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
    return allowedTypes.some((t) => t === ext || t === file.type)
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedFile = (field.value as File | null | undefined) ?? null

        const setFile = ({ file }: { file: File | null }): void => {
          field.onChange(file)
        }

        const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
          e.preventDefault()
          setIsDragging(false)
          const file = e.dataTransfer.files?.[0] ?? null
          if (file && isAllowed({ file })) setFile({ file })
        }

        const handleClear = (e: MouseEvent<HTMLButtonElement>): void => {
          e.stopPropagation()
          setFile({ file: null })
          if (inputRef.current) inputRef.current.value = ''
        }

        return (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={name}>{label}</Label>
            <div
              role="button"
              tabIndex={0}
              aria-label={`Upload ${label}`}
              className={cn(
                'border-input hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                isDragging && 'border-primary bg-primary/5',
                fieldState.error && 'border-destructive',
                className
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              onBlur={field.onBlur}
            >
              <input
                ref={inputRef}
                id={name}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(e) => setFile({ file: e.target.files?.[0] ?? null })}
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-medium">{selectedFile.name}</span>
                  <button
                    type="button"
                    aria-label="Remove file"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleClear}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-foreground text-sm">Drop file here or click to browse</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Accepted: {allowedTypes.join(', ')}
                  </p>
                </>
              )}
            </div>
            {fieldState.error?.message && (
              <p className="text-destructive text-sm">{fieldState.error.message}</p>
            )}
          </div>
        )
      }}
    />
  )
}

export { FileInput }
