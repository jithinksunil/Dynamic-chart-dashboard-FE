import toast, { type ToastOptions } from 'react-hot-toast'
import axios from 'axios'

function extractErrorMessage({ err }: { err: unknown }): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string })?.message ?? err.message
  }
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Client error'
}

interface ToastMessageOptions {
  options?: ToastOptions
}

export const toastMessage = {
  success({ message, options }: { message: string } & ToastMessageOptions): void {
    toast.success(message, options)
  },
  error({ err, options }: { err: unknown } & ToastMessageOptions): void {
    toast.error(extractErrorMessage({ err }), options)
  },
  info({ message, options }: { message: string } & ToastMessageOptions): void {
    toast(message, options)
  },
  loading({ message, options }: { message: string } & ToastMessageOptions): string {
    return toast.loading(message, options)
  },
  dismiss({ id }: { id?: string }): void {
    toast.dismiss(id)
  },
}
