---
name: api-integration
description: Add a new API integration following the project's three-layer pattern — interfaces, requests, and TanStack Query hooks. Use this whenever a new API endpoint needs to be wired up.
argument-hint: <domain>
---

# API Integration Skill

This skill adds a complete API integration following the project's three-layer pattern.

---

## Folder Structure

```
src/
  api/           # Axios instances (axiosPublic, axiosPrivate)
  requests/      # Raw API call functions (one file per domain)
  hooks/         # TanStack Query hooks wrapping request functions (one file per domain)
  interfaces/    # TypeScript interfaces for request/response shapes (one file per domain)
```

---

## Axios Instances — Public vs Private

Two axios instances live in `src/api/axios.ts`:

| Instance       | Where to use                              | When to use                                                                                |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `axiosPublic`  | imported directly in the **request file** | Unauthenticated endpoints (login, register, public data)                                   |
| `axiosPrivate` | via `useAxiosPrivate()` in the **hook**   | Authenticated endpoints — attaches `Authorization` header and handles token refresh on 401 |

**Public requests** — import `axiosPublic` directly inside `src/requests/<domain>.requests.ts`. No axios parameter needed:

```ts
// src/requests/auth.requests.ts
import { axiosPublic } from '../api'

export const signIn = ({ data }: { data: SignInRequest }) =>
  axiosPublic.post<SigninResponse>('/auth/sign-in', data)
```

**Private requests** — the request function accepts an `AxiosInstance` parameter. The hook calls `useAxiosPrivate()` and passes the result in:

```ts
// src/requests/dashboard.requests.ts
import type { AxiosInstance } from 'axios'

export const getWidgets = ({ axios }: { axios: AxiosInstance }) =>
  axios.get<WidgetListResponse>('/dashboard/widgets')
```

```ts
// src/hooks/dashboard.hooks.ts
const axios = useAxiosPrivate()
const response = await getWidgets({ axios })
```

---

## 1. Interface — `src/interfaces/<domain>.interface.ts`

Define all request payloads and response shapes here. Every request and response **must** have an explicit TypeScript type.

```ts
// src/interfaces/dashboard.interface.ts

export interface CreateWidgetPayload {
  name: string
  type: 'chart' | 'table' | 'metric'
  config: Record<string, unknown>
}

export interface Widget {
  id: string
  name: string
  type: 'chart' | 'table' | 'metric'
  config: Record<string, unknown>
  createdAt: string
}

export interface WidgetListResponse {
  widgets: Widget[]
  total: number
}
```

Export everything through `src/interfaces/index.ts`:

```ts
export * from './dashboard.interface'
```

---

## 2. Request — `src/requests/<domain>.requests.ts`

Each function is a thin wrapper around an axios call. Always pass the response generic type to the axios method so the return type is `Promise<AxiosResponse<T>>`.

- **Public endpoints**: import `axiosPublic` directly — no axios parameter.
- **Private endpoints**: accept `{ axios: AxiosInstance }` — the hook injects the interceptor-equipped instance.

```ts
// src/requests/dashboard.requests.ts

import type { AxiosInstance } from 'axios'
import { axiosPublic } from '../api'
import type { CreateWidgetPayload, Widget, WidgetListResponse } from '@/interfaces'

// Public GET — axiosPublic imported directly, no parameter
export const getPublicAnnouncements = () =>
  axiosPublic.get<AnnouncementListResponse>('/announcements')

// Private GET — accepts axios from hook
export const getWidgets = ({ axios }: { axios: AxiosInstance }) =>
  axios.get<WidgetListResponse>('/dashboard/widgets')

export const getWidgetById = ({ axios, id }: { axios: AxiosInstance; id: string }) =>
  axios.get<Widget>(`/dashboard/widgets/${id}`)

// Private POST / PUT / PATCH — typed payload
export const createWidget = ({
  axios,
  data,
}: {
  axios: AxiosInstance
  data: CreateWidgetPayload
}) => axios.post<Widget>('/dashboard/widgets', data)

export const updateWidget = ({
  axios,
  id,
  data,
}: {
  axios: AxiosInstance
  id: string
  data: Partial<CreateWidgetPayload>
}) => axios.patch<Widget>(`/dashboard/widgets/${id}`, data)

// Private DELETE — no response body, use `void` generic
export const deleteWidget = ({ axios, id }: { axios: AxiosInstance; id: string }) =>
  axios.delete<void>(`/dashboard/widgets/${id}`)
```

Export through `src/requests/index.ts`:

```ts
export * from './dashboard.requests'
```

---

## 3. Hook — `src/hooks/<domain>.hooks.ts`

Wrap each request in a TanStack Query hook. Follow these rules:

- **`useQuery`** for GET requests (read).
- **`useMutation`** for POST / PUT / PATCH / DELETE (write).
- Always unwrap `response.data` in `queryFn` / `mutationFn` so consumers receive the typed payload directly.
- `queryKey` arrays must include every variable the query depends on so cache invalidation is correct.
- Add an `enabled` parameter (default `true`) to every `useQuery` hook so callers can defer fetching.
- **Private endpoints**: call `useAxiosPrivate()` at the top of the hook and pass the result to the request function.
- **Public endpoints**: `axiosPublic` is already imported inside the request file — the hook calls the request with no axios argument.
- **`onSuccess` / `onError` belong in the component**, not the hook. Do not add these callbacks inside `useMutation` or `useQuery` hooks — callers handle side-effects (toasts, redirects, state updates) via the mutation/query result directly.

```ts
// src/hooks/dashboard.hooks.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useAxiosPrivate from './useAxiosPrivate.hook'
import { axiosPublic } from '@/api'
import {
  getWidgets,
  getWidgetById,
  getPublicAnnouncements,
  createWidget,
  updateWidget,
  deleteWidget,
} from '@/requests'
import type { CreateWidgetPayload } from '@/interfaces'

// --- Private: uses useAxiosPrivate() ---

export const useGetWidgets = (enabled = true) => {
  const axios = useAxiosPrivate()
  return useQuery({
    enabled,
    queryKey: ['widgets'],
    queryFn: async () => {
      const response = await getWidgets(axios)
      return response.data
    },
  })
}

export const useGetWidgetById = (id: string, enabled = true) => {
  const axios = useAxiosPrivate()
  return useQuery({
    enabled,
    queryKey: ['widgets', id],
    queryFn: async () => {
      const response = await getWidgetById(axios, id)
      return response.data
    },
  })
}

export const useCreateWidget = () => {
  const axios = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateWidgetPayload) => {
      const response = await createWidget(axios, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] })
    },
  })
}

export const useUpdateWidget = (id: string) => {
  const axios = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreateWidgetPayload>) => {
      const response = await updateWidget(axios, id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', id] })
    },
  })
}

export const useDeleteWidget = () => {
  const axios = useAxiosPrivate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteWidget(axios, id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] })
    },
  })
}

// --- Public: uses axiosPublic imported directly ---

export const useGetPublicAnnouncements = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await getPublicAnnouncements(axiosPublic)
      return response.data
    },
  })
```

Export through `src/hooks/index.ts`:

```ts
export * from './dashboard.hooks'
```

---

## 4. Consuming mutations in components

Prefer **`mutateAsync` with `async`/`await` inside a `try` / `catch`** over `mutate` with `onSuccess` / `onError` callbacks. The async form keeps success and failure side-effects co-located with the submit handler, plays nicely with `react-hook-form`'s async `onSubmit`, and lets you `await` follow-up work (e.g. token storage before navigation).

```tsx
import { toastMessage } from '@/utility'

const { mutateAsync: signIn, isPending } = useSignIn()

const onSubmit = async (values: SignInValues): Promise<void> => {
  try {
    const data = await signIn(values)
    setAuth({ accessToken: data.accessToken, role: data.role })
    toastMessage.success({ message: 'Welcome back!' })
    navigate('/dashboard')
  } catch (error: unknown) {
    toastMessage.error({ err: error })
  }
}
```

Rules:

- Destructure as `mutateAsync` (rename it to a domain-specific verb, e.g. `signIn`, `createWidget`).
- Wrap the call in `try` / `catch` — never let a rejected promise escape `react-hook-form`'s `handleSubmit`.
- Use `mutate` (no `Async`) only for fire-and-forget calls where the component does not need to sequence further work after success.
- **Always use `toastMessage` from `@/utility`** for success/error feedback — never `react-hot-toast`'s `toast` directly. Pass the caught error as `{ err: error }` to `toastMessage.error` so the backend's `response.data.message` is extracted automatically; pass strings as `{ message }` to `toastMessage.success` / `info`.

---

## Checklist for adding a new API integration

- [ ] Interface file created / updated in `src/interfaces/<domain>.interface.ts`
- [ ] Interface exported from `src/interfaces/index.ts`
- [ ] Request functions added to `src/requests/<domain>.requests.ts` with correct generic type
- [ ] Requests exported from `src/requests/index.ts`
- [ ] TanStack Query hooks added to `src/hooks/<domain>.hooks.ts`
  - [ ] `useQuery` for reads with `queryKey` covering all dependencies and `enabled` param
  - [ ] `useMutation` for writes — no `onSuccess`/`onError` in the hook; handled by the component
- [ ] Hooks exported from `src/hooks/index.ts`

---

## Conventions at a glance

| Concern        | Rule                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| Private axios  | `const axios = useAxiosPrivate()` in the hook, passed to the request function |
| Public axios   | `axiosPublic` imported directly in the **request file** — not in the hook     |
| Generic type   | Always provide `<ResponseType>` to axios method                               |
| Data unwrap    | `return response.data` inside `queryFn` / `mutationFn`                        |
| Query key      | `[domain, ...params]` — include every variable used                           |
| Deferred fetch | `enabled` boolean param on every `useQuery` hook                              |
| Side-effects   | `onSuccess`/`onError` go in the **component**, not the hook                   |
| Mutation calls | Prefer `mutateAsync` + `await` in `try`/`catch` over `mutate` with callbacks  |
| Type imports   | Use `import type` for type-only imports                                       |
