export interface Route {
  path: string
  component: LazyExoticComponent<() => JSX.Element>
  roles?: Roles[]
  requiredAuth: boolean
  title?: string
}

export interface ApplicationRoutes {
  layout?: LazyExoticComponent<() => JSX.Element>
  routes: Route[]
}
