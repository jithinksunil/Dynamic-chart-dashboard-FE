import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  BuildChartRequest,
  BuildChartResponse,
  ChatMessage,
  ChartBuilderData,
  ChartValuesResponse,
  ChartMetaItem,
  CsvUploadItem,
  SendChatMessageRequest,
  UpdateChartMetaRequest,
  UpdateChartMetaResponse,
  UploadCsvResponse,
} from '@/interfaces'
import {
  buildChart,
  getChatMessages,
  getChartBuilder,
  getChartMeta,
  listCsvUploads,
  sendChatMessage,
  updateChartMeta,
  uploadCsv,
} from '@/requests'
import { normalizeChartBuilderResponse, normalizeChartMetaResponse } from '@/utility'
import useAxiosPrivate from './useAxiosPrivate.hook'

interface UseListCsvUploadsParams {
  enabled?: boolean
}

interface UseCsvUploadChartParams {
  csvUploadId: string
  enabled?: boolean
}

export const useListCsvUploads = ({ enabled = true }: UseListCsvUploadsParams = {}): UseQueryResult<
  CsvUploadItem[],
  Error
> => {
  const axios = useAxiosPrivate()

  return useQuery({
    enabled,
    queryKey: ['csv-uploads'],
    queryFn: async (): Promise<CsvUploadItem[]> => {
      const response = await listCsvUploads({ axios })
      return response.data
    },
  })
}

export const useUploadCsv = (): UseMutationResult<UploadCsvResponse, Error, File> => {
  const axios = useAxiosPrivate()

  return useMutation({
    mutationFn: async (file: File): Promise<UploadCsvResponse> => {
      const response = await uploadCsv({ axios, file })
      return response.data
    },
  })
}

export const useCsvUploadChartMeta = ({
  csvUploadId,
  enabled = true,
}: UseCsvUploadChartParams): UseQueryResult<ChartMetaItem[], Error> => {
  const axios = useAxiosPrivate()

  return useQuery({
    enabled: enabled && csvUploadId.length > 0,
    queryKey: ['csv-upload-chart-meta', csvUploadId],
    queryFn: async (): Promise<ChartMetaItem[]> => {
      const response = await getChartMeta({ axios, csvUploadId })
      return normalizeChartMetaResponse({ value: response.data })
    },
  })
}

export const useCsvUploadChartData = ({
  csvUploadId,
  enabled = true,
}: UseCsvUploadChartParams): UseQueryResult<ChartValuesResponse, Error> => {
  const axios = useAxiosPrivate()

  return useQuery({
    enabled: enabled && csvUploadId.length > 0,
    queryKey: ['csv-upload-chart-data', csvUploadId],
    queryFn: async (): Promise<ChartValuesResponse> => {
      const response = await getChartMeta({ axios, csvUploadId })
      return response.data
    },
  })
}

export const useChartBuilder = ({
  csvUploadId,
  enabled = true,
}: UseCsvUploadChartParams): UseQueryResult<ChartBuilderData, Error> => {
  const axios = useAxiosPrivate()

  return useQuery({
    enabled: enabled && csvUploadId.length > 0,
    queryKey: ['csv-upload-chart-builder', csvUploadId],
    queryFn: async (): Promise<ChartBuilderData> => {
      const response = await getChartBuilder({ axios, csvUploadId })
      return normalizeChartBuilderResponse({ value: response.data })
    },
  })
}

export const useBuildChart = ({
  csvUploadId,
}: {
  csvUploadId: string
}): UseMutationResult<BuildChartResponse, Error, BuildChartRequest> => {
  const axios = useAxiosPrivate()

  return useMutation({
    mutationFn: async (data: BuildChartRequest): Promise<BuildChartResponse> => {
      const response = await buildChart({ axios, csvUploadId, data })
      return response.data
    },
  })
}

export const useUpdateChartMeta = ({
  csvUploadId,
}: {
  csvUploadId: string
}): UseMutationResult<
  UpdateChartMetaResponse,
  Error,
  { chartMetaDataId: string; data: UpdateChartMetaRequest }
> => {
  const axios = useAxiosPrivate()

  return useMutation({
    mutationFn: async ({ chartMetaDataId, data }): Promise<UpdateChartMetaResponse> => {
      const response = await updateChartMeta({ axios, csvUploadId, chartMetaDataId, data })
      return response.data
    },
  })
}

interface UseChartChatParams {
  chartMetaDataId: string
  enabled?: boolean
}

export const useGetChartChat = ({
  chartMetaDataId,
  enabled = true,
}: UseChartChatParams): UseQueryResult<ChatMessage[], Error> => {
  const axios = useAxiosPrivate()

  return useQuery({
    enabled: enabled && chartMetaDataId.length > 0,
    queryKey: ['chart-chat', chartMetaDataId],
    queryFn: async (): Promise<ChatMessage[]> => {
      const response = await getChatMessages({ axios, chartMetaDataId })
      return [...response.data].reverse()
    },
  })
}

export const useSendChartMessage = ({
  chartMetaDataId,
}: {
  chartMetaDataId: string
}): UseMutationResult<ChatMessage, Error, SendChatMessageRequest> => {
  const axios = useAxiosPrivate()
  const queryClient = useQueryClient()
  const queryKey = ['chart-chat', chartMetaDataId]

  return useMutation({
    mutationFn: async (data: SendChatMessageRequest): Promise<ChatMessage> => {
      const response = await sendChatMessage({ axios, chartMetaDataId, data })
      return response.data
    },
    onMutate: async ({ content }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ChatMessage[]>(queryKey)
      const userMessage: ChatMessage = {
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      }
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => [...old, userMessage])
      return { previous }
    },
    onSuccess: (agentMessage) => {
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => [...old, agentMessage])
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
  })
}
