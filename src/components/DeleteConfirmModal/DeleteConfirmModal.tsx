import { useEffect } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { X } from 'lucide-react'

interface DeleteConfirmModalProps {
  title: string
  description: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({
  title,
  description,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    const handleKeyDown = ({ key }: KeyboardEvent): void => {
      if (key === 'Escape') onCancel()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-6 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div className="absolute inset-0" aria-hidden="true" onClick={onCancel} />
        <Card className="relative z-10 w-full max-w-md border border-border/70 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle id="delete-confirm-title">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close modal"
                onClick={onCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
