import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  BuildChartRequest,
  BuildChartResponse,
  ChatMessage,
  ChartBuilderResponse,
  ChartValuesResponse,
  CsvUploadItem,
  SendChatMessageRequest,
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

interface UpdateChartMetaParams {
  chartMetaDataId: string
  data: UpdateChartMetaRequest
  axios: AxiosInstance
}

interface GetChatMessagesParams {
  axios: AxiosInstance
  chartMetaDataId: string
}

interface SendChatMessageParams {
  axios: AxiosInstance
  chartMetaDataId: string
  data: SendChatMessageRequest
}

interface DeleteCsvUploadParams {
  axios: AxiosInstance
  csvUploadId: string
}

interface DeleteChartParams {
  axios: AxiosInstance
  chartMetaDataId: string
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
}: CsvUploadIdParams): Promise<AxiosResponse<ChartValuesResponse>> =>
  axios.get<ChartValuesResponse>(`/chart/${csvUploadId}/chart-values`)

export const getChartBuilder = ({
  axios,
  csvUploadId,
}: CsvUploadIdParams): Promise<AxiosResponse<ChartBuilderResponse>> =>
  axios.get<ChartBuilderResponse>(`/chart/${csvUploadId}/meta`)

export const buildChart = ({
  axios,
  csvUploadId,
  data,
}: BuildChartParams): Promise<AxiosResponse<BuildChartResponse>> =>
  axios.post<BuildChartResponse>(`/chart/${csvUploadId}/build-chart`, data)

export const updateChartMeta = ({
  axios,
  chartMetaDataId,
  data,
}: UpdateChartMetaParams): Promise<AxiosResponse<UpdateChartMetaResponse>> =>
  axios.patch<UpdateChartMetaResponse>(`/chart/${chartMetaDataId}`, data)

export const getChatMessages = ({
  axios,
  chartMetaDataId,
}: GetChatMessagesParams): Promise<AxiosResponse<ChatMessage[]>> =>
  axios.get<ChatMessage[]>(`/chart/${chartMetaDataId}/chat`)

export const sendChatMessage = ({
  axios,
  chartMetaDataId,
  data,
}: SendChatMessageParams): Promise<AxiosResponse<ChatMessage>> =>
  axios.post<ChatMessage>(`/chart/${chartMetaDataId}/chat`, data)

export const deleteCsvUpload = ({
  axios,
  csvUploadId,
}: DeleteCsvUploadParams): Promise<AxiosResponse<void>> =>
  axios.delete<void>(`/csv-upload/${csvUploadId}`)

export const deleteChart = ({
  axios,
  chartMetaDataId,
}: DeleteChartParams): Promise<AxiosResponse<void>> =>
  axios.delete<void>(`/chart/${chartMetaDataId}`)
