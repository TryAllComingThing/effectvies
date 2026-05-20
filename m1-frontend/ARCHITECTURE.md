# M1 Frontend Architecture

## 1. Goals

This project should evolve from a prototype-style frontend into a production-grade business system frontend with these qualities:

- Clear layered architecture
- Stable permission and routing model
- Predictable module development pattern
- Strong type constraints
- Easy onboarding and low-cost expansion
- Testable, reviewable, and releasable engineering workflow

## 2. Current State

The project already has:

- Vue 3 + Vite + TypeScript
- Vue Router based page structure
- Pinia based user and platform stores
- Axios request wrapper
- Basic role-based access control
- Independent menu entry pages for system management

The main gaps are:

- Permission model is still role-centric, not permission-centric
- Dynamic routing and menu authorization are not established
- Business logic is still concentrated in page files
- Global reusable CRUD patterns are not standardized
- Quality gates, tests, and release workflow are missing

## 3. Target Architecture

The frontend should follow six layers:

1. View layer
- `views/`
- Page composition only
- No heavy CRUD logic

2. Business component layer
- `components/business/`
- Domain dialogs, drawers, editors, advanced tables

3. Common component layer
- `components/common/`
- Shared form, table, pagination, status, exception, and toolbar components

4. Composable layer
- `composables/core/`
- `composables/modules/`
- State orchestration, list query logic, form submission logic, permission helpers

5. State layer
- `store/modules/`
- User, auth, app, dict, platform

6. Infrastructure layer
- `api/`
- `utils/`
- `types/`
- `router/`

## 4. Recommended Directory Structure

```text
src/
├── api/
│   ├── auth.ts
│   ├── system/
│   └── performance/
├── assets/
├── components/
│   ├── common/
│   └── business/
├── composables/
│   ├── core/
│   └── modules/
├── directives/
├── layouts/
├── router/
│   ├── index.ts
│   ├── routes.ts
│   ├── guard.ts
│   └── modules/
├── store/
│   ├── index.ts
│   └── modules/
│       ├── user.ts
│       ├── auth.ts
│       ├── app.ts
│       ├── dict.ts
│       └── platform.ts
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── system.ts
│   └── common.ts
├── utils/
│   ├── request.ts
│   ├── auth.ts
│   ├── constant.ts
│   ├── common.ts
│   └── error.ts
├── views/
└── main.ts
```

## 5. Routing Design

### 5.1 Route Categories

- Constant routes
  - login
  - root layout
  - dashboard
  - fallback routes

- Business routes
  - system management
  - performance management
  - analysis and reports

### 5.2 Route Meta Contract

Each route should gradually converge to this meta model:

```ts
type AppRouteMeta = {
  title: string
  icon?: string
  requiresAuth?: boolean
  roles?: Array<'admin' | 'user'>
  permissions?: string[]
  hidden?: boolean
  keepAlive?: boolean
  activeMenu?: string
  order?: number
}
```

### 5.3 Guard Strategy

The guard should enforce the following sequence:

1. Check login state
2. Restore or initialize authorization state
3. Reject unauthorized route access
4. Update page title and layout state

Dynamic route injection can be added in the next stage after the backend menu contract is stable.

## 6. Permission Model

### 6.1 Authorization Units

The system should support four permission dimensions:

- Role permissions
- Menu permissions
- Button permissions
- Data scope permissions

### 6.2 Backend Authorization Contract

The long-term backend response should contain:

```ts
type AuthorizationPayload = {
  roles: string[]
  permissions: string[]
  menus: Array<{
    name: string
    path: string
    component?: string
    icon?: string
    children?: AuthorizationPayload['menus']
  }>
}
```

### 6.3 Frontend Authorization Storage

`authStore` is responsible for:

- `roles`
- `permissions`
- `menuRouteNames`
- `hasInitialized`
- `hydrateAuthorization()`
- `setAuthorizationByRole()`
- `clearAuthorization()`
- `canAccessRoute()`

### 6.4 Permission Usage Rules

- Page routing uses route meta plus auth store
- Sidebar rendering uses authorized route set
- Buttons use `v-permission`
- In-script checks use `hasPermission()` and `hasRole()`

## 7. Store Design

### 7.1 userStore

Responsibilities:

- token
- profile
- login state
- profile persistence

### 7.2 authStore

Responsibilities:

- roles
- permissions
- menu route names
- route access checks
- future dynamic route generation

### 7.3 appStore

Planned responsibilities:

- global loading
- tab navigation
- sidebar collapse
- layout preferences
- error state

### 7.4 dictStore

Planned responsibilities:

- dictionary cache
- select option conversion
- lazy loading
- stale data refresh

## 8. Request Layer Design

The request layer should be standardized around:

- request interceptor
- response interceptor
- business code handling
- login expiration handling
- upload and download helpers
- duplicate submission prevention
- request cancel support

Standard response types:

```ts
type ApiResult<T> = {
  code: number
  message: string
  data: T
  traceId: string
}

type PageResult<T> = {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}
```

## 9. Module Development Standard

Each business module should follow the same structure.

Example: user management

```text
api/system/user.ts
types/system.ts
views/system/user/UserListView.vue
components/business/system/UserFormDialog.vue
components/business/system/UserDetailDrawer.vue
composables/modules/system/useUserList.ts
composables/modules/system/useUserForm.ts
```

Responsibilities:

- `View`: page composition only
- `Business component`: domain UI block
- `Composable`: domain logic
- `API`: transport only

## 10. Common Component Roadmap

These components should be built first:

- `SearchBar`
- `TableToolbar`
- `DataTable`
- `PagePagination`
- `FormDialog`
- `DetailDrawer`
- `StatusSwitch`
- `PageStatus`
- `ExceptionView`

## 11. Stability and Error Handling

The project should add:

- 403 page
- 404 page
- 500 page
- request error normalization
- form double-submit prevention
- empty state
- loading skeleton
- retry entry for failed pages

## 12. Engineering Quality

The engineering baseline should include:

- ESLint
- Prettier
- Stylelint
- Husky
- lint-staged
- Vitest
- Playwright
- CI with type-check, test, and build

## 13. Delivery Plan

### Phase 1: foundation

- auth store
- permission helpers
- route meta standardization
- route guard upgrade
- request layer strengthening

### Phase 2: system module standardization

- refactor system management into module-based structure
- extract CRUD common components
- extract core composables

### Phase 3: business integration

- performance file management
- performance task management
- review flow
- reporting and analysis

### Phase 4: engineering hardening

- unit tests
- e2e tests
- CI
- release process
- monitoring and metrics

## 14. Immediate Implementation Rules

Starting now, new code should follow these rules:

- No direct permission checks in templates using raw role logic
- No new complex business logic directly in page views
- No direct axios usage outside `utils/request.ts`
- No hardcoded route labels, status text, or permission codes inside views
- New CRUD modules must be split into view, business component, composable, and api layers

## 15. Current First-Step Scope

The first step implemented together with this document is:

- Introduce `authStore`
- Introduce permission utility functions
- Upgrade `v-permission`
- Upgrade route guard and layout route access filtering
- Keep current routes compatible while preparing for future dynamic authorization
