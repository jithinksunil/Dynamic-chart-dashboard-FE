import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  BuildChartRequest,
  BuildChartResponse,
  CsvUploadItem,
  UploadCsvResponse,
  UpdateChartMetaRequest,
  UpdateChartMetaResponse,
} from '@/interfaces'

interface ListCsvUploadsParams {
  axios: AxiosInstance
}

interface UploadCsvParams {
  axios: AxiosInstance
  file: File
}

interface CsvUploadIdParams {
  axios: AxiosInstance
  csvUploadId: string
}

interface BuildChartParams extends CsvUploadIdParams {
  data: BuildChartRequest
}

interface UpdateChartMetaParams extends CsvUploadIdParams {
  chartMetaDataId: string
  data: UpdateChartMetaRequest
}

export const listCsvUploads = ({
  axios,
}: ListCsvUploadsParams): Promise<AxiosResponse<CsvUploadItem[]>> =>
  axios.get<CsvUploadItem[]>('/csv-upload/')

export const uploadCsv = ({
  axios,
  file,
}: UploadCsvParams): Promise<AxiosResponse<UploadCsvResponse>> => {
  const formData = new FormData()
  formData.append('file', file)

  return axios.post<UploadCsvResponse>('/csv-upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getChartMeta = ({
  axios,
  csvUploadId,
}: CsvUploadIdParams): Promise<AxiosResponse<unknown>> =>
  axios.get<unknown>(`/chart/${csvUploadId}/values`)

export const getChartBuilder = ({
  axios,
  csvUploadId,
}: CsvUploadIdParams): Promise<AxiosResponse<unknown>> =>
  axios.get<unknown>(`/chart/${csvUploadId}/meta`)

export const buildChart = ({
  axios,
  csvUploadId,
  data,
}: BuildChartParams): Promise<AxiosResponse<BuildChartResponse>> =>
  axios.post<BuildChartResponse>(`/chart/${csvUploadId}/build`, data)

export const updateChartMeta = ({
  axios,
  csvUploadId,
  chartMetaDataId,
  data,
}: UpdateChartMetaParams): Promise<AxiosResponse<UpdateChartMetaResponse>> =>
  axios.put<UpdateChartMetaResponse>(`/chart/${csvUploadId}/chart-meta/${chartMetaDataId}`, data)
