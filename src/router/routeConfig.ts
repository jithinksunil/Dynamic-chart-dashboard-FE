import type { ApplicationRoutes } from '@/interfaces'
import { Roles } from '@/utility'
import { lazy } from 'react'

const SignIn = lazy(() => import('@/pages/SignIn'))
const SignUp = lazy(() => import('@/pages/SignUp'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const CsvUploadDetail = lazy(() => import('@/pages/CsvUploadDetail'))

export const routeConfig: ApplicationRoutes[] = [
  {
    routes: [
      { path: '/', component: SignIn, title: 'Sign In' },
      { path: '/sign-up', component: SignUp, title: 'Sign Up' },
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
