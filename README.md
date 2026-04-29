# Dynamic Dashboard — Frontend

A React 19 + TypeScript + Vite application that lets users upload CSV datasets, build interactive charts from that data, and chat with an AI assistant about each chart.

## Features

- **Authentication** — Sign up, sign in, and silent token refresh via HTTP-only cookies. Routes are protected by role-based guards.
- **CSV Dashboard** — Upload CSV files, browse upload history, and delete uploads (with confirmation).
- **Chart Builder** — For any uploaded CSV, create Bar, Line, or Pie charts by selecting x-axis, y-axis, and chart type from the available columns. Charts can be renamed, reconfigured, or deleted.
- **AI Chat** — Open a sliding chat panel for any chart and ask the AI assistant questions about the data. Responses are rendered as sanitized HTML (DOMPurify).

## Tech Stack

| Concern                   | Library                       |
| ------------------------- | ----------------------------- |
| UI framework              | React 19                      |
| Language                  | TypeScript 6                  |
| Build tool                | Vite 8 (Oxc transform)        |
| Server state              | TanStack Query v5             |
| Routing                   | React Router DOM v7           |
| Forms & validation        | React Hook Form + Zod         |
| Charts                    | Recharts                      |
| Styling                   | Tailwind CSS v4 + shadcn/ui   |
| HTTP client               | Axios (with JWT interceptors) |
| HTML sanitisation         | DOMPurify                     |
| Icons                     | Lucide React                  |
| Toasts                    | react-hot-toast               |
| Package manager / runtime | Bun                           |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- A running instance of the backend API

### Setup

```bash
# Install dependencies
bun install

# Copy the environment template and set your API base URL
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL=http://localhost:<port>
```

### Development

```bash
bun dev        # Start the dev server with HMR at http://localhost:5173
```

### Production Build

```bash
bun build      # Type-check then bundle (tsc -b && vite build)
bun preview    # Preview the production bundle locally
```

### Code Quality

```bash
bun lint            # Run ESLint
bun format          # Format all files with Prettier
bun spell-check     # Run cspell spell checker
bun run check       # Run all checks: spell-check, format:check, typecheck, lint
```

## Project Structure

```
src/
├── api/              # Axios instances (public + private with JWT interceptors)
├── components/
│   ├── buttons/      # PrimaryButton, SecondaryButton, LinkButton
│   ├── ChartAIChat/  # Sliding AI chat panel for a chart
│   ├── common/       # RequireAuth route guard
│   ├── DeleteConfirmModal/
│   ├── forms/        # EmailInput, PasswordInput, TextInput, FileInput
│   ├── layouts/      # AuthLayout, DashboardLayout
│   └── ui/           # shadcn/ui primitives (Button, Card, Input, Label)
├── context/          # AuthContext + AuthProvider (access token, role)
├── hooks/            # TanStack Query hooks for auth, CSV uploads, and charts
├── interfaces/       # All TypeScript interfaces and types
├── pages/            # Lazy-loaded page components
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   ├── Dashboard.tsx          # CSV upload list
│   ├── CsvUploadDetail.tsx    # Chart builder and viewer
│   └── NotFound.tsx
├── requests/         # Raw Axios request functions (one per API resource)
├── router/           # Route config + BrowserRouter setup
└── utility/          # Helpers, constants, enums, toast utilities, chart normalisation
```

## Architecture

### API Layer (three layers)

1. **`interfaces/`** — TypeScript interfaces for every request/response shape.
2. **`requests/`** — Pure Axios functions that accept an `AxiosInstance` and typed parameters, returning `AxiosResponse<T>`.
3. **`hooks/`** — TanStack Query `useQuery` / `useMutation` wrappers. All data fetching and mutation goes through these hooks; no raw fetch/axios is used in components.

### Authentication

- On app load, `useInitialAuth` attempts a silent token refresh via the `/auth/refresh` cookie endpoint and redirects to `/dashboard` on success.
- `useAxiosPrivate` attaches the in-memory access token as a `Bearer` header and automatically retries a failed request (HTTP 401) after refreshing the token — transparent to callers.
- Auth state (`accessToken`, `role`) lives in React context via `AuthProvider`.

### Routing

Routes are declared in `routeConfig.ts` as data objects. The `Router` component maps them to nested `<Route>` elements, wrapping protected routes with `<RequireAuth>`. All page components are loaded with `React.lazy` + `Suspense`.

### Chart Normalisation

The `utility/chart.ts` module contains defensive normalisation helpers (`normalizeChartRenderItems`, `normalizeChartBuilderResponse`, etc.) that map loosely-typed API responses into strict typed `ChartRenderItem` / `ChartBuilderData` objects before they reach components.

## API Endpoints Used

| Method | Path                               | Purpose                          |
| ------ | ---------------------------------- | -------------------------------- |
| POST   | `/auth/sign-in`                    | Sign in                          |
| POST   | `/auth/sign-up`                    | Sign up                          |
| POST   | `/auth/refresh`                    | Silent token refresh             |
| POST   | `/auth/sign-out`                   | Sign out                         |
| GET    | `/auth/me`                         | Fetch current user profile       |
| GET    | `/csv-upload/`                     | List uploaded CSV files          |
| POST   | `/csv-upload/`                     | Upload a CSV file                |
| DELETE | `/csv-upload/:id`                  | Delete a CSV upload              |
| GET    | `/chart/:csvUploadId/meta`         | Fetch chart builder axis options |
| GET    | `/chart/:csvUploadId/chart-values` | Fetch all charts with their data |
| POST   | `/chart/:csvUploadId/build-chart`  | Create a new chart               |
| PATCH  | `/chart/:chartMetaDataId`          | Update chart name/type/axes      |
| DELETE | `/chart/:chartMetaDataId`          | Delete a chart                   |
| GET    | `/chart/:chartMetaDataId/chat`     | Fetch chat history for a chart   |
| POST   | `/chart/:chartMetaDataId/chat`     | Send a message to the AI         |

## Environment Variables

| Variable            | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL of the backend API (e.g. `http://localhost:3000`) |

See [.env.example](.env.example) for the full template.

## Code Conventions

- **Single object argument** — all functions take a single destructured object parameter.
- **Explicit return types** — all functions declare a return type; React components are the only exception.
- **`interface` over `type`** — use `type` only for unions, mapped types, or template literal types.
- **Barrel exports** — every leaf folder has an `index.ts`; parent folders with subfolders do not.
- **No inline types via indexed access** — always declare a named interface instead of `Parent['child']`.
- **`import type`** — type-only imports always use `import type`.
- Prettier (single quotes, no semicolons, 2-space indent, 100-char line width) is enforced as an ESLint error.
- Pre-commit hook runs `bun run check` via Husky.
