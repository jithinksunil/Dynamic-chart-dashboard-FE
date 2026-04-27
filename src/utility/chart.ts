import type { ChartBuilderData, ChartDatum, ChartMetaItem, ChartRenderItem } from '@/interfaces'

interface UnknownRecord {
  [key: string]: unknown
}

function isRecord({ value }: { value: unknown }): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function getString({ record, keys }: { record: UnknownRecord; keys: string[] }): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  return null
}

function toStringArray({ value }: { value: unknown }): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function toColumnNameArray({ value }: { value: unknown }): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item): string | null => {
      if (typeof item === 'string' && item.trim().length > 0) {
        return item
      }

      if (!isRecord({ value: item })) {
        return null
      }

      return getString({
        record: item,
        keys: ['columnName', 'column', 'name', 'field'],
      })
    })
    .filter((item): item is string => item !== null)
}

function findArray({ record, keys }: { record: UnknownRecord; keys: string[] }): string[] {
  for (const key of keys) {
    const values = toStringArray({ value: record[key] })
    if (values.length > 0) {
      return values
    }
  }

  return []
}

function findColumnArray({ record, keys }: { record: UnknownRecord; keys: string[] }): string[] {
  for (const key of keys) {
    const values = toColumnNameArray({ value: record[key] })
    if (values.length > 0) {
      return values
    }
  }

  return []
}

function getChartRecord({ value }: { value: unknown }): UnknownRecord | null {
  return isRecord({ value }) ? value : null
}

function getNestedRecord({
  record,
  keys,
}: {
  record: UnknownRecord
  keys: string[]
}): UnknownRecord | null {
  for (const key of keys) {
    if (isRecord({ value: record[key] })) {
      return record[key]
    }
  }

  return null
}

function getNestedArray({ record, keys }: { record: UnknownRecord; keys: string[] }): unknown[] {
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key]
    }
  }

  return []
}

function isChartObject({ value }: { value: unknown }): value is UnknownRecord {
  if (!isRecord({ value })) {
    return false
  }

  const hasChartMetadata =
    getString({ record: value, keys: ['name', 'chartName', 'title'] }) !== null &&
    getString({ record: value, keys: ['chartType', 'type', 'chart_type'] }) !== null

  return hasChartMetadata && Array.isArray(value.data)
}

function toChartDatum({ value }: { value: unknown }): ChartDatum | null {
  if (!isRecord({ value })) {
    return null
  }

  const chartDatum: ChartDatum = {}

  for (const [key, entryValue] of Object.entries(value)) {
    if (typeof entryValue === 'number' && Number.isFinite(entryValue)) {
      chartDatum[key] = entryValue
      continue
    }

    if (typeof entryValue === 'string') {
      const parsedValue = Number(entryValue)
      chartDatum[key] =
        Number.isFinite(parsedValue) && entryValue.trim() !== '' ? parsedValue : entryValue
      continue
    }

    chartDatum[key] = null
  }

  return chartDatum
}

function normalizeChartDataArray({ value }: { value: unknown }): ChartDatum[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => toChartDatum({ value: item }))
    .filter((item): item is ChartDatum => item !== null)
}

function normalizeChartMetaItem({
  value,
  index,
}: {
  value: unknown
  index: number
}): ChartMetaItem | null {
  if (!isRecord({ value })) {
    return null
  }

  const id = getString({ record: value, keys: ['id', '_id'] }) ?? `chart-${index}`
  const name =
    getString({ record: value, keys: ['name', 'chartName', 'title'] }) ?? 'Untitled chart'
  const chartType =
    getString({ record: value, keys: ['chartType', 'type', 'chart_type'] }) ?? 'Unknown'
  const xAxis = getString({ record: value, keys: ['xAxis', 'x_axis', 'xAxisKey'] }) ?? 'Not set'
  const yAxis = getString({ record: value, keys: ['yAxis', 'y_axis', 'yAxisKey'] }) ?? 'Not set'
  const createdAt =
    getString({ record: value, keys: ['createdAt', 'created_at', 'updatedAt', 'updated_at'] }) ??
    null

  return {
    id,
    name,
    chartType,
    xAxis,
    yAxis,
    createdAt,
  }
}

export function normalizeChartMetaResponse({ value }: { value: unknown }): ChartMetaItem[] {
  const items = Array.isArray(value)
    ? value
    : isRecord({ value })
      ? ((value.chartMeta ??
          value.charts ??
          value.data ??
          value.items ??
          value.results ??
          []) as unknown[])
      : []

  return items
    .map((item, index) => normalizeChartMetaItem({ value: item, index }))
    .filter((item): item is ChartMetaItem => item !== null)
}

export function normalizeChartBuilderResponse({ value }: { value: unknown }): ChartBuilderData {
  const builderRecord =
    isRecord({ value }) && isRecord({ value: value.builder }) ? value.builder : value

  if (!isRecord({ value: builderRecord })) {
    return {
      chartTypes: [],
      xAxisOptions: [],
      yAxisOptions: [],
    }
  }

  return {
    chartTypes: findArray({
      record: builderRecord,
      keys: ['chartTypes', 'chartTypeOptions', 'types'],
    }),
    xAxisOptions: findColumnArray({
      record: builderRecord,
      keys: ['availableXAxises', 'xAxisOptions', 'xAxis', 'xAxes', 'columns', 'headers'],
    }),
    yAxisOptions: findColumnArray({
      record: builderRecord,
      keys: ['availableYAxises', 'yAxisOptions', 'yAxis', 'yAxes', 'columns', 'headers'],
    }),
  }
}

export function getChartItems({ value }: { value: unknown }): unknown[] {
  if (Array.isArray(value)) {
    return value
  }

  if (!isRecord({ value })) {
    return []
  }

  if (isChartObject({ value })) {
    return [value]
  }

  return getNestedArray({
    record: value,
    keys: ['charts', 'chartData', 'data', 'items', 'results'],
  })
}

export function normalizeChartRenderItems({ value }: { value: unknown }): ChartRenderItem[] {
  return getChartItems({ value })
    .map((item, index): ChartRenderItem | null => {
      const chartRecord = getChartRecord({ value: item })
      if (!chartRecord) {
        return null
      }

      const metadataRecord =
        getNestedRecord({ record: chartRecord, keys: ['metaData', 'metadata', 'chartMeta'] }) ??
        chartRecord
      const nestedDataRecord = getNestedRecord({
        record: chartRecord,
        keys: ['chart', 'payload', 'result'],
      })

      const id = getString({ record: metadataRecord, keys: ['id', '_id'] }) ?? `chart-${index}`
      const name =
        getString({ record: metadataRecord, keys: ['name', 'chartName', 'title'] }) ??
        `Chart ${index + 1}`
      const chartType =
        getString({ record: metadataRecord, keys: ['chartType', 'type', 'chart_type'] }) ?? 'BAR'
      const xAxis =
        getString({
          record: metadataRecord,
          keys: ['xAxis', 'x_axis', 'xAxisKey', 'labelKey', 'nameKey'],
        }) ?? 'name'
      const yAxis =
        getString({
          record: metadataRecord,
          keys: ['yAxis', 'y_axis', 'yAxisKey', 'valueKey', 'dataKey'],
        }) ?? 'value'
      const data =
        normalizeChartDataArray({
          value:
            chartRecord.data ??
            chartRecord.chartData ??
            chartRecord.values ??
            chartRecord.records ??
            chartRecord.points ??
            chartRecord.dataset ??
            nestedDataRecord?.data ??
            nestedDataRecord?.chartData ??
            [],
        }) ?? []

      return {
        id,
        name,
        chartType,
        xAxis,
        yAxis,
        data,
        raw: item,
      }
    })
    .filter((item): item is ChartRenderItem => item !== null)
}

export function getChartDisplayName({ value, index }: { value: unknown; index: number }): string {
  const chartRecord = getChartRecord({ value })
  if (!chartRecord) {
    return `Chart ${index + 1}`
  }

  const metadataRecord =
    getNestedRecord({ record: chartRecord, keys: ['metaData', 'metadata', 'chartMeta'] }) ??
    chartRecord

  return (
    getString({ record: metadataRecord, keys: ['name', 'chartName', 'title'] }) ??
    `Chart ${index + 1}`
  )
}

export function getChartAxisKey({
  data,
  preferredKey,
  kind,
}: {
  data: ChartDatum[]
  preferredKey: string
  kind: 'category' | 'number'
}): string | null {
  if (data.length === 0) {
    return preferredKey.trim().length > 0 ? preferredKey : null
  }

  const firstDatum = data[0]

  if (preferredKey in firstDatum) {
    if (kind === 'category' && typeof firstDatum[preferredKey] === 'string') {
      return preferredKey
    }

    if (kind === 'number' && typeof firstDatum[preferredKey] === 'number') {
      return preferredKey
    }
  }

  for (const [key, value] of Object.entries(firstDatum)) {
    if (kind === 'category' && typeof value === 'string') {
      return key
    }

    if (kind === 'number' && typeof value === 'number') {
      return key
    }
  }

  return null
}

export function getChartTotal({
  data,
  valueKey,
}: {
  data: ChartDatum[]
  valueKey: string | null
}): number | null {
  if (!valueKey) {
    return null
  }

  const values = data
    .map((item) => item[valueKey])
    .filter((item): item is number => typeof item === 'number' && Number.isFinite(item))

  if (values.length === 0) {
    return null
  }

  return values.reduce((sum, value) => sum + value, 0)
}

function toDateTimestamp({ value }: { value: unknown }): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null
  }

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : timestamp
}

export function isDateAxis({ data, key }: { data: ChartDatum[]; key: string | null }): boolean {
  if (!key || data.length === 0) {
    return false
  }

  const values = data.map((item) => item[key]).filter((item) => item !== null)
  if (values.length === 0) {
    return false
  }

  return values.every((value) => toDateTimestamp({ value }) !== null)
}

export function sortChartData({
  data,
  key,
}: {
  data: ChartDatum[]
  key: string | null
}): ChartDatum[] {
  if (!key || !isDateAxis({ data, key })) {
    return data
  }

  return [...data].sort((leftItem, rightItem) => {
    const leftTimestamp = toDateTimestamp({ value: leftItem[key] }) ?? 0
    const rightTimestamp = toDateTimestamp({ value: rightItem[key] }) ?? 0
    return leftTimestamp - rightTimestamp
  })
}

const axisDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const tooltipDateFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatChartAxisValue({ value }: { value: unknown }): string {
  const timestamp = toDateTimestamp({ value })
  if (timestamp === null) {
    return String(value ?? '')
  }

  return axisDateFormatter.format(new Date(timestamp))
}

export function formatChartTooltipValue({ value }: { value: unknown }): string {
  const timestamp = toDateTimestamp({ value })
  if (timestamp === null) {
    return String(value ?? '')
  }

  return tooltipDateFormatter.format(new Date(timestamp))
}
