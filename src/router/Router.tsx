import React, { Fragment, lazy, Suspense } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { routeConfig } from './routeConfig'
import { RequireAuth } from '@/components/common'

const NotFound = lazy(() => import('@/pages/NotFound'))

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routeConfig.map(({ routes, layout }, index) => {
          const Layout = layout || Fragment
          return (
            <Route
              key={index}
              element={
                <Suspense
                  fallback={
                    <div className="bg-background flex min-h-screen items-center justify-center px-4">
                      <p className="text-muted-foreground text-sm">Loading...</p>
                    </div>
                  }
                >
                  <Layout>
                    <Outlet />
                  </Layout>
                </Suspense>
              }
            >
              {routes.map(({ component, path, requiredAuth, roles }, childIndex) => {
                const Component = component
                const Guard = requiredAuth ? <RequireAuth allowedRoles={roles} /> : <Outlet />
                return (
                  <Route key={`${index},${childIndex}`} element={Guard}>
                    <Route
                      path={path}
                      element={
                        <Suspense
                          fallback={
                            <div className="bg-background flex min-h-screen items-center justify-center px-4">
                              <p className="text-muted-foreground text-sm">Loading...</p>
                            </div>
                          }
                        >
                          <Component />
                        </Suspense>
                      }
                    />
                  </Route>
                )
              })}
            </Route>
          )
        })}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
