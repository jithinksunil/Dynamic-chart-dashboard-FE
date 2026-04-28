import type { ApplicationRoutes } from '@/interfaces'
import { Roles } from '@/utility'
import { lazy } from 'react'

const SignIn = lazy(() => import('@/pages/SignIn').then((module) => ({ default: module.SignIn })))
const SignUp = lazy(() => import('@/pages/SignUp').then((module) => ({ default: module.SignUp })))
const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then((module) => ({ default: module.Dashboard }))
)
const CsvUploadDetail = lazy(() =>
  import('@/pages/CsvUploadDetail').then((module) => ({ default: module.CsvUploadDetail }))
)

export const routeConfig: ApplicationRoutes[] = [
  {
    routes: [
      { path: '/', component: SignIn, title: 'Sign In', requiredAuth: false },
      { path: '/sign-up', component: SignUp, title: 'Sign Up', requiredAuth: false },
    ],
  },
  {
    routes: [
      {
        path: '/dashboard',
        component: Dashboard,
        requiredAuth: true,
        roles: [Roles.USER],
        title: 'Dashboard',
      },
      {
        path: '/dashboard/uploads/:csvUploadId',
        component: CsvUploadDetail,
        requiredAuth: true,
        roles: [Roles.USER],
        title: 'CSV Upload Detail',
      },
    ],
  },
]
