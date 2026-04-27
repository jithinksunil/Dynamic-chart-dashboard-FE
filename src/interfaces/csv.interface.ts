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

export interface BuildChartRequest {
  chartType: string
  xAxis: string
  yAxis: string
  name?: string
}

export interface BuildChartResponse {
  id?: string
  message?: string
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
