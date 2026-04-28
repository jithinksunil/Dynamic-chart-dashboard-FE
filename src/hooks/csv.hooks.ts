import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import type {
  BuildChartRequest,
  BuildChartResponse,
  ChartBuilderData,
  ChartMetaItem,
  CsvUploadItem,
  UpdateChartMetaRequest,
  UpdateChartMetaResponse,
  UploadCsvResponse,
} from '@/interfaces'
import {
  buildChart,
  getChartBuilder,
  getChartMeta,
  listCsvUploads,
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
}: UseCsvUploadChartParams): UseQueryResult<unknown, Error> => {
  const axios = useAxiosPrivate()

  return useQuery({
    enabled: enabled && csvUploadId.length > 0,
    queryKey: ['csv-upload-chart-data', csvUploadId],
    queryFn: async (): Promise<unknown> => {
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
