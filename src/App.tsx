import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'

const SignIn = lazy(() => import('@/pages/SignIn'))
const SignUp = lazy(() => import('@/pages/SignUp'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const CsvUploadDetail = lazy(() => import('@/pages/CsvUploadDetail'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="bg-background flex min-h-screen items-center justify-center px-4">
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/uploads/:csvUploadId"
            element={
              <ProtectedRoute>
                <CsvUploadDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
