import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronRight, FileSpreadsheet, LayoutDashboard, Upload } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PrimaryButton } from '@/components/buttons'
import { FileInput } from '@/components/forms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context'
import { useListCsvUploads, useUploadCsv } from '@/hooks'
import { toastMessage } from '@/utility'

const csvUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a CSV file' }).refine(
    (file) => {
      const normalizedName = file.name.toLowerCase()
      return normalizedName.endsWith('.csv') || file.type === 'text/csv'
    },
    { message: 'Only CSV files are accepted' }
  ),
})

type CsvUploadFormValues = z.infer<typeof csvUploadSchema>

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function Dashboard() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const { mutateAsync: uploadCsv, isPending: isUploading } = useUploadCsv()
  const {
    data: csvUploads = [],
    isLoading: isLoadingCsvUploads,
    isError: isCsvUploadsError,
    error: csvUploadsError,
  } = useListCsvUploads()

  const { control, handleSubmit, reset } = useForm<CsvUploadFormValues>({
    resolver: zodResolver(csvUploadSchema),
  })

  const uploadsCountLabel = useMemo((): string => {
    if (csvUploads.length === 1) {
      return '1 uploaded file'
    }

    return `${csvUploads.length} uploaded files`
  }, [csvUploads.length])

  const onSubmit = async ({ file }: CsvUploadFormValues): Promise<void> => {
    try {
      await uploadCsv(file)
      toastMessage.success({ message: 'CSV uploaded successfully' })
      reset()
      await queryClient.invalidateQueries({ queryKey: ['csv-uploads'] })
    } catch (error: unknown) {
      toastMessage.error({ err: error })
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-border/70 bg-card px-5 py-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 border-primary/20 flex size-12 shrink-0 items-center justify-center rounded-lg border">
              <LayoutDashboard className="text-primary h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-foreground text-2xl font-semibold">CSV Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Upload CSV files and keep track of the datasets available in your account.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-sm">
            <p className="text-muted-foreground">Signed in as</p>
            <p className="text-foreground font-medium">{auth.role}</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <Card className="border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="text-primary h-4 w-4" />
                Upload CSV
              </CardTitle>
              <CardDescription>
                Choose a CSV file to send to `dynamicDashboardBE` for processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <FileInput
                  control={control}
                  name="file"
                  label="Dataset file"
                  allowedTypes={['.csv', 'text/csv']}
                />
                <PrimaryButton type="submit" className="w-full sm:w-auto" disabled={isUploading}>
                  {isUploading ? 'Uploading…' : 'Upload CSV'}
                </PrimaryButton>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="text-primary h-4 w-4" />
                Upload history
              </CardTitle>
              <CardDescription>{uploadsCountLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCsvUploads ? (
                <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
                  Loading your uploaded CSV files...
                </div>
              ) : null}

              {isCsvUploadsError ? (
                <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm">
                  <p className="text-foreground font-medium">Could not load your uploads.</p>
                  <p className="text-muted-foreground">{csvUploadsError.message}</p>
                </div>
              ) : null}

              {!isLoadingCsvUploads && !isCsvUploadsError && csvUploads.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
                  No CSV files uploaded yet. Your first upload will show up here.
                </div>
              ) : null}

              {!isLoadingCsvUploads && !isCsvUploadsError && csvUploads.length > 0 ? (
                <ul className="space-y-3">
                  {csvUploads.map((csvUpload) => (
                    <li
                      key={csvUpload.id}
                      className="rounded-lg border border-border/70 bg-background"
                    >
                      <button
                        type="button"
                        className="hover:bg-muted/40 flex w-full items-start justify-between gap-4 rounded-lg px-4 py-3 text-left transition-colors"
                        onClick={() => navigate(`/dashboard/uploads/${csvUpload.id}`)}
                      >
                        <div className="min-w-0">
                          <p className="text-foreground truncate font-medium">
                            {csvUpload.fileName}
                          </p>
                          <p className="text-muted-foreground mt-1 text-sm">
                            Uploaded {dateFormatter.format(new Date(csvUpload.createdAt))}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-xs">
                            Ready
                          </span>
                          <ChevronRight className="text-muted-foreground h-4 w-4" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
