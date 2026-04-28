import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileSpreadsheet, Plus, X, Pencil, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Controller, useForm } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import type { ChartDatum, ChartRenderItem } from '@/interfaces'
import { PrimaryButton } from '@/components/buttons'
import { ChartAIChat } from '@/components/ChartAIChat'
import { TextInput } from '@/components/forms'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  buttonVariants,
} from '@/components/ui'
import {
  useBuildChart,
  useChartBuilder,
  useCsvUploadChartData,
  useGetChartChat,
  useListCsvUploads,
  useSendChartMessage,
  useUpdateChartMeta,
} from '@/hooks'
import { cn } from '@/lib/utils'
import {
  formatChartAxisValue,
  formatChartTooltipValue,
  formatCompactNumber,
  getChartAxisKey,
  getChartDisplayName,
  isDateAxis,
  normalizeChartRenderItems,
  sortChartData,
  toastMessage,
  truncateText,
} from '@/utility'

const chartBuilderSchema = z.object({
  name: z.string().trim().min(1, 'Please enter a chart name'),
  chartType: z.string().trim().min(1, 'Please select a chart type'),
  xAxis: z.string().trim().min(1, 'Please select an x-axis'),
  yAxis: z.string().trim().min(1, 'Please select a y-axis'),
})

type ChartBuilderFormValues = z.infer<typeof chartBuilderSchema>

const CHART_TYPE_OPTIONS = ['BAR', 'LINE', 'PIE']

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

interface SelectFieldProps {
  name: keyof ChartBuilderFormValues
  label: string
  options: string[]
  control: Control<ChartBuilderFormValues>
}

const CHART_COLORS = ['#2563eb', '#0f766e', '#db2777', '#f59e0b', '#7c3aed', '#ea580c']
const DATE_AXIS_DATA_KEY = '__dateAxisTimestamp'

interface ChartRendererProps {
  chart: ChartRenderItem
}

function ChartRenderer({ chart }: ChartRendererProps) {
  const normalizedChartType = chart.chartType.trim().toUpperCase()
  const categoryKey = getChartAxisKey({
    data: chart.data,
    preferredKey: chart.xAxis,
    kind: 'category',
  })
  const numberKey = getChartAxisKey({
    data: chart.data,
    preferredKey: chart.yAxis,
    kind: 'number',
  })
  const hasDateXAxis = isDateAxis({ data: chart.data, key: categoryKey })
  const sortedChartData = sortChartData({ data: chart.data, key: categoryKey })
  const chartData = hasDateXAxis
    ? sortedChartData.map((item) => ({
        ...item,
        [DATE_AXIS_DATA_KEY]:
          typeof item[categoryKey ?? ''] === 'string'
            ? Date.parse(item[categoryKey ?? ''] as string)
            : null,
      }))
    : sortedChartData

  if (chartData.length === 0 || !categoryKey || !numberKey) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
        We could not map this chart response into a Recharts dataset yet.
      </div>
    )
  }

  if (normalizedChartType === 'PIE') {
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey={numberKey}
              nameKey={categoryKey}
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, value }: { name?: string; value?: number }) => {
                const label = hasDateXAxis
                  ? formatChartTooltipValue({ value: name })
                  : truncateText({ value: String(name ?? '') })
                return `${label}: ${formatCompactNumber({ value: value ?? 0 })}`
              }}
            >
              {chartData.map((_item: ChartDatum, index: number) => (
                <Cell
                  key={`${chart.id}-slice-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]
                  const label = hasDateXAxis
                    ? formatChartTooltipValue({ value: String(data.name) })
                    : String(data.name)
                  const formattedValue = formatCompactNumber({ value: data.value as number })

                  return (
                    <div
                      className="bg-card text-foreground rounded-lg p-2.5 text-sm"
                      style={{ boxShadow: 'var(--shadow)' }}
                    >
                      <p className="mb-1.5 font-medium">{label}</p>
                      <p style={{ color: data.payload.fill ?? data.color }}>
                        {numberKey} : {formattedValue}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (normalizedChartType === 'LINE') {
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/70" />
            <XAxis
              dataKey={hasDateXAxis ? DATE_AXIS_DATA_KEY : categoryKey}
              type={hasDateXAxis ? 'number' : 'category'}
              scale={hasDateXAxis ? 'time' : 'auto'}
              domain={hasDateXAxis ? ['dataMin', 'dataMax'] : undefined}
              tickFormatter={(value) => formatChartAxisValue({ value, isDate: hasDateXAxis })}
              minTickGap={24}
            />
            <YAxis tickFormatter={(value) => formatCompactNumber({ value: value as number })} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: 'var(--shadow)',
              }}
              itemStyle={{ color: 'var(--foreground)' }}
              labelStyle={{ color: 'var(--foreground)' }}
              labelFormatter={(value) =>
                hasDateXAxis
                  ? formatChartTooltipValue({ value, isDate: true })
                  : formatChartTooltipValue({ value })
              }
              formatter={(value, name) => [formatCompactNumber({ value: value as number }), name]}
            />
            <Legend formatter={(value) => truncateText({ value: String(value) })} />
            <Line
              type="monotone"
              dataKey={numberKey}
              stroke={CHART_COLORS[0]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/70" />
          <XAxis
            dataKey={hasDateXAxis ? DATE_AXIS_DATA_KEY : categoryKey}
            type={hasDateXAxis ? 'number' : 'category'}
            scale={hasDateXAxis ? 'time' : 'auto'}
            domain={hasDateXAxis ? ['dataMin', 'dataMax'] : undefined}
            tickFormatter={(value) => formatChartAxisValue({ value, isDate: hasDateXAxis })}
            minTickGap={24}
          />
          <YAxis tickFormatter={(value) => formatCompactNumber({ value: value as number })} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: 'var(--shadow)',
            }}
            itemStyle={{ color: 'var(--foreground)' }}
            labelStyle={{ color: 'var(--foreground)' }}
            labelFormatter={(value) =>
              hasDateXAxis
                ? formatChartTooltipValue({ value, isDate: true })
                : formatChartTooltipValue({ value })
            }
            formatter={(value, name) => [formatCompactNumber({ value: value as number }), name]}
          />
          <Legend formatter={(value) => truncateText({ value: String(value) })} />
          <Bar dataKey={numberKey} radius={[6, 6, 0, 0]} fill={CHART_COLORS[1]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function SelectField({ control, label, name, options }: SelectFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={name}>{label}</Label>
          <div className="relative">
            <select
              id={name}
              aria-invalid={!!fieldState.error}
              className={cn(
                'border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full appearance-none rounded-lg border py-2 pl-3 pr-8 text-sm outline-none focus-visible:ring-3 scheme-dark',
                fieldState.error && 'border-destructive'
              )}
              {...field}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <svg
              className="text-muted-foreground pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          {fieldState.error?.message ? (
            <p className="text-destructive text-sm">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  )
}

export function CsvUploadDetail() {
  const queryClient = useQueryClient()
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [editingChartItem, setEditingChartItem] = useState<ChartRenderItem | null>(null)
  const [aiChatChartItem, setAiChatChartItem] = useState<ChartRenderItem | null>(null)
  const { data: aiChatMessages = [] } = useGetChartChat({
    chartMetaDataId: aiChatChartItem?.id ?? '',
    enabled: aiChatChartItem !== null,
  })
  const { mutateAsync: sendMessage, isPending: isSendingMessage } = useSendChartMessage({
    chartMetaDataId: aiChatChartItem?.id ?? '',
  })
  const { csvUploadId = '' } = useParams()
  const {
    data: csvUploads = [],
    isLoading: isLoadingCsvUploads,
    isError: isCsvUploadsError,
  } = useListCsvUploads()
  const {
    data: chartBuilderData,
    isLoading: isLoadingBuilder,
    isError: isBuilderError,
    error: builderError,
  } = useChartBuilder({
    csvUploadId,
    enabled: isBuilderOpen && csvUploadId.length > 0,
  })
  const {
    data: chartData,
    isLoading: isLoadingChartData,
    isError: isChartDataError,
    error: chartDataError,
  } = useCsvUploadChartData({
    csvUploadId,
    enabled: csvUploadId.length > 0,
  })
  const { mutateAsync: createChart, isPending: isCreatingChart } = useBuildChart({ csvUploadId })
  const { mutateAsync: updateChart, isPending: isUpdatingChart } = useUpdateChartMeta({
    csvUploadId,
  })

  const { control, handleSubmit, getValues, setValue, reset } = useForm<ChartBuilderFormValues>({
    resolver: zodResolver(chartBuilderSchema),
    defaultValues: {
      name: '',
      chartType: CHART_TYPE_OPTIONS[0],
      xAxis: '',
      yAxis: '',
    },
  })

  const csvUpload = useMemo(
    () => csvUploads.find((upload) => upload.id === csvUploadId) ?? null,
    [csvUploadId, csvUploads]
  )
  const chartItems = useMemo(() => normalizeChartRenderItems({ value: chartData }), [chartData])

  const closeBuilderModal = useCallback((): void => {
    setIsBuilderOpen(false)
    setEditingChartItem(null)
    reset({
      name: '',
      chartType: CHART_TYPE_OPTIONS[0],
      xAxis: chartBuilderData?.xAxisOptions[0] ?? '',
      yAxis: chartBuilderData?.yAxisOptions[0] ?? '',
    })
  }, [chartBuilderData, reset])

  const openAIChat = useCallback((chartItem: ChartRenderItem): void => {
    setAiChatChartItem(chartItem)
  }, [])

  const closeAIChat = useCallback((): void => {
    setAiChatChartItem(null)
  }, [])

  const openEditBuilderModal = useCallback(
    (chartItem: ChartRenderItem): void => {
      setEditingChartItem(chartItem)
      reset({
        name: chartItem.name,
        chartType: chartItem.chartType.trim().toUpperCase(),
        xAxis: chartItem.xAxis,
        yAxis: chartItem.yAxis,
      })
      setIsBuilderOpen(true)
    },
    [reset]
  )

  useEffect(() => {
    if (!chartBuilderData) {
      return
    }

    const currentValues = getValues()

    if (!currentValues.chartType) {
      setValue('chartType', CHART_TYPE_OPTIONS[0], { shouldValidate: true })
    }
    if (!currentValues.xAxis && chartBuilderData.xAxisOptions[0]) {
      setValue('xAxis', chartBuilderData.xAxisOptions[0], { shouldValidate: true })
    }
    if (!currentValues.yAxis && chartBuilderData.yAxisOptions[0]) {
      setValue('yAxis', chartBuilderData.yAxisOptions[0], { shouldValidate: true })
    }
  }, [chartBuilderData, getValues, setValue])

  useEffect(() => {
    if (!isBuilderOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow

    const handleKeyDown = ({ key }: KeyboardEvent): void => {
      if (key === 'Escape') {
        closeBuilderModal()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeBuilderModal, isBuilderOpen])

  const onSubmit = async ({
    name,
    chartType,
    xAxis,
    yAxis,
  }: ChartBuilderFormValues): Promise<void> => {
    try {
      if (editingChartItem) {
        await updateChart({
          chartMetaDataId: editingChartItem.id,
          data: {
            name,
            chartType,
            xAxis,
            yAxis,
          },
        })
        toastMessage.success({ message: 'Chart updated successfully' })
      } else {
        await createChart({
          name,
          chartType,
          xAxis,
          yAxis,
        })
        toastMessage.success({ message: 'Chart created successfully' })
      }

      closeBuilderModal()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['csv-upload-chart-data', csvUploadId] }),
        queryClient.invalidateQueries({ queryKey: ['csv-upload-chart-builder', csvUploadId] }),
      ])
    } catch (error: unknown) {
      toastMessage.error({ err: error })
    }
  }

  if (csvUploadId.length === 0) {
    return (
      <Card className="w-full max-w-xl border border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Missing upload id</CardTitle>
          <CardDescription>We could not determine which CSV upload to open.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <header className="flex flex-col gap-4 rounded-lg border border-border/70 bg-card px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 border-primary/20 flex size-12 shrink-0 items-center justify-center rounded-lg border">
                <FileSpreadsheet className="text-primary h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h1 className="text-foreground text-2xl font-semibold">
                  {csvUpload?.fileName ?? 'CSV upload'}
                </h1>
                {csvUpload?.createdAt ? (
                  <p className="text-muted-foreground text-sm">
                    Uploaded {dateFormatter.format(new Date(csvUpload.createdAt))}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <Button size="lg" className="sm:self-start" onClick={() => setIsBuilderOpen(true)}>
            <Plus className="h-4 w-4" />
            Build Chart
          </Button>
        </div>

        {isLoadingCsvUploads ? (
          <p className="text-muted-foreground text-sm">Loading upload details...</p>
        ) : null}
        {isCsvUploadsError ? (
          <p className="text-muted-foreground text-sm">
            We could not match this page to the upload history, but the chart APIs can still load by
            id.
          </p>
        ) : null}
      </header>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-foreground text-lg font-semibold">Charts</h2>
        </div>

        {isLoadingChartData ? (
          <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
            Loading chart data...
          </div>
        ) : null}

        {isChartDataError ? (
          <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm">
            <p className="text-foreground font-medium">Could not load chart data.</p>
            <p className="text-muted-foreground">{chartDataError.message}</p>
          </div>
        ) : null}

        {!isLoadingChartData && !isChartDataError && chartItems.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
            No chart data returned for this upload.
          </div>
        ) : null}

        {!isLoadingChartData && !isChartDataError && chartItems.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {chartItems.map((chartItem, index) => (
              <Card key={chartItem.id} className="border border-border/70 shadow-sm" size="sm">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{getChartDisplayName({ value: chartItem.raw, index })}</CardTitle>
                    <CardDescription>
                      {chartItem.chartType} chart using {chartItem.xAxis} and {chartItem.yAxis}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="AI chat for chart"
                      onClick={() => openAIChat(chartItem)}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit chart"
                      onClick={() => openEditBuilderModal(chartItem)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ChartRenderer chart={chartItem} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      {aiChatChartItem ? (
        <ChartAIChat
          chartName={aiChatChartItem.name}
          messages={aiChatMessages}
          onClose={closeAIChat}
          isPending={isSendingMessage}
          onSend={async ({ content }) => {
            try {
              await sendMessage({ content })
              await queryClient.invalidateQueries({
                queryKey: ['chart-chat', aiChatChartItem.id],
              })
            } catch (error: unknown) {
              toastMessage.error({ err: error })
            }
          }}
        />
      ) : null}

      {isBuilderOpen ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-6 sm:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="build-chart-title"
        >
          <div className="flex min-h-full items-start justify-center sm:items-center">
            <div className="absolute inset-0" aria-hidden="true" onClick={closeBuilderModal} />
            <Card className="relative z-10 w-full max-w-lg border border-border/70 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle id="build-chart-title">
                      {editingChartItem ? 'Edit Chart' : 'Build Chart'}
                    </CardTitle>
                    <CardDescription>
                      {editingChartItem
                        ? 'Update your chart configuration.'
                        : 'Select one x-axis, one y-axis, and one chart type to create the chart.'}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close modal"
                    onClick={closeBuilderModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[calc(100svh-12rem)] space-y-4 overflow-y-auto">
                {isLoadingBuilder ? (
                  <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
                    Loading chart builder options...
                  </div>
                ) : null}

                {isBuilderError ? (
                  <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm">
                    <p className="text-foreground font-medium">
                      Could not load chart builder data.
                    </p>
                    <p className="text-muted-foreground">{builderError.message}</p>
                  </div>
                ) : null}

                {!isLoadingBuilder && !isBuilderError && chartBuilderData ? (
                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <TextInput
                      control={control}
                      name="name"
                      label="Chart name"
                      placeholder="Enter chart name"
                    />
                    <SelectField
                      control={control}
                      name="chartType"
                      label="Chart type"
                      options={CHART_TYPE_OPTIONS}
                    />
                    <SelectField
                      control={control}
                      name="xAxis"
                      label="X-axis"
                      options={chartBuilderData.xAxisOptions}
                    />
                    <SelectField
                      control={control}
                      name="yAxis"
                      label="Y-axis"
                      options={chartBuilderData.yAxisOptions}
                    />

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={closeBuilderModal}
                      >
                        Cancel
                      </Button>
                      <PrimaryButton
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={isCreatingChart || isUpdatingChart}
                      >
                        {isCreatingChart || isUpdatingChart
                          ? editingChartItem
                            ? 'Updating chart…'
                            : 'Creating chart…'
                          : editingChartItem
                            ? 'Update chart'
                            : 'Create chart'}
                      </PrimaryButton>
                    </div>
                  </form>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  )
}
