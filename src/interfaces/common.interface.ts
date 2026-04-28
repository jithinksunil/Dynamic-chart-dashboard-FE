import type { ComponentType, JSX, LazyExoticComponent, ReactNode } from 'react'
import type { Roles } from '@/utility'

export interface Route {
  path: string
  component: LazyExoticComponent<() => JSX.Element>
  roles?: Roles[]
  requiredAuth: boolean
  title?: string
}

export interface ApplicationRoutes {
  layout?: ComponentType<{ children: ReactNode }>
  routes: Route[]
}
