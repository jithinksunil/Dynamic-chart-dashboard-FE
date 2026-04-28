export interface CsvUploadItem {
  id: string
  fileName: string
  createdAt: string
}

export interface UploadCsvResponse {
  csvUploadId: string
}

export interface ChartMetaItem {
  id: string
  name: string
  chartType: string
  xAxis: string
  yAxis: string
  createdAt: string | null
}

export interface ChartBuilderData {
  chartTypes: string[]
  xAxisOptions: string[]
  yAxisOptions: string[]
}

export interface ChartAxisOption {
  columnName: string
  type: 'TEXT' | 'NUMBER' | 'DATE_ISO'
}

export interface ChartBuilderResponse {
  availableXAxises: ChartAxisOption[]
  availableYAxises: ChartAxisOption[]
}

export interface ChartValueRow {
  [key: string]: string | number
}

export interface ChartValueItem {
  id: string
  name: string
  chartType: 'BAR' | 'LINE' | 'PIE'
  xAxis: string
  yAxis: string
  data: ChartValueRow[]
}

export type ChartValuesResponse = ChartValueItem[]

export interface BuildChartRequest {
  chartType: string
  xAxis: string
  yAxis: string
  name?: string
}

export interface BuildChartResponse {
  id: string
}

export interface UpdateChartMetaRequest {
  chartType: string
  xAxis: string
  yAxis: string
  name?: string
}

export interface UpdateChartMetaResponse {
  id: string
}

export interface ChartDatum {
  [key: string]: string | number | null
}

export interface ChartRenderItem {
  id: string
  name: string
  chartType: string
  xAxis: string
  yAxis: string
  data: ChartDatum[]
  raw: unknown
}
