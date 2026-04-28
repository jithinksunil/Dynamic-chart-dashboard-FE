import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster position="top-right" />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  // </StrictMode>
)
