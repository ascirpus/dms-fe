# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DMS-FE (Document Management System Frontend) is a Vue 3 application for managing and annotating PDF documents within projects. It uses Keycloak for authentication and communicates with a backend API.

## Development Commands

```bash
npm run dev      # Start dev server (https://dms.local:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Local Development Setup

The app requires hosts in `/etc/hosts`:
```
127.0.0.1 dms.internal auth.dms.internal api.dms.internal
```

Services:
- Frontend: `https://dms.internal:5173`
- Backend API: `http://api.dms.internal:8080`
- Keycloak: `http://auth.dms.internal:8083`

Environment variables (`.env`):
- `VITE_DOCUMENT_STORE_URL` - API base URL (proxied through Vite)
- `VITE_AUTH_PROVIDER` - Keycloak URL
- `VITE_AUTH_CLIENT_ID` - Keycloak client ID
- `VITE_AUTH_REALM` - Keycloak realm

## Backend API Reference

Backend source: `/evo/Work/dms` (Kotlin Spring)
API documentation: `http://localhost:8080/v3/api-docs` (fetch with curl)

When implementing frontend features, reference the API docs to ensure correct integration with backend endpoints.

## Architecture

### Authentication (`src/composables/useAuth.ts`)
Central auth composable using `@josempgon/vue-keycloak`. Provides:
- Authenticated Axios client with automatic token refresh
- Login/logout functions
- User info from decoded JWT

All authenticated API calls should use `apiClient` from `useAuth()`.

### Services (`src/services/`)
Services extend `ApiService<T>` base class which wraps Axios and unwraps the standard `ApiResponse<T>` format (`{ status, data }`).

- `DocumentsService` - Document CRUD
- `ProjectsService` - Project CRUD
- `CommentsService` - Comment operations
- `NotificationsService` - Notification management and preferences

### Composables (`src/composables/`)
Vue composables wrapping services with vue-query for caching:
- `useDocuments` - Document fetching with query caching
- `useComments` - Comment operations
- `useNotifications` - Notification fetching, marking as read, and preferences
- `useAuth` - Authentication (see above)
- `useRoutes` - Router factory with auth guards

### State Management
- Pinia stores in `src/stores/`
- `mainStore` - UI state (theme, sidebar), persisted
- `authStore` - User/auth state (legacy, most auth moved to `useAuth`)

### UI Components
- PrimeVue 4 with Aura theme
- Tailwind CSS 4 via `@tailwindcss/vite`
- PDF viewing via `vue-pdf-embed` and `vue3-pdfjs`

### Route Structure
Routes defined in `src/composables/useRoutes.ts`:
- `/` - Home/Dashboard
- `/login` - Login page
- `/projects` - Project list (authenticated)
- `/projects/:id` - Project detail
- `/projects/:id/documents/:documentId` - Document viewer in project context
- `/documents` - Document list (authenticated)
- `/documents/:id` - Single document view

### Type System
Types in `src/types/`:
- Request DTOs in `types/requests/`
- Response DTOs in `types/response/`
- Domain types: `Document`, `Project`, `User`, `Comment`
- Mappers in `src/mappers/` for DTO conversion

### Path Alias
`@` maps to `src/` directory.

## Design System (Figma Integration)

### Design Tokens

**CSS Custom Properties** (`src/style.css`):
```css
:root {
  --primary-color: #3b82f6;
  --primary-dark: #2563eb;
  --surface-ground: #f8fafc;
  --surface-section: #ffffff;
  --surface-card: #ffffff;
  --surface-overlay: #ffffff;
  --surface-border: #e2e8f0;
  --text-color: #334155;
  --text-secondary: #64748b;
}

html.dark {
  --surface-ground: #1e293b;
  --surface-section: #0f172a;
  --surface-card: #1e293b;
  --surface-border: #334155;
  --text-color: #f8fafc;
  --text-secondary: #cbd5e1;
}
```

**Semantic Colors:**
- Primary: `#3b82f6` (blue-500)
- Success: `#27ae60`
- Danger: `#e74c3c`
- Warning: Yellow/Orange tones

**Typography:** Inter font family, Tailwind text scale

### Component Patterns

**PrimeVue 4 + Aura theme** - Always use PrimeVue components:

```vue
<!-- Buttons -->
<Button label="Save" icon="pi pi-check" />
<Button label="Cancel" text severity="secondary" />
<Button icon="pi pi-trash" severity="danger" text />
<Button icon="pi pi-pencil" class="p-button-rounded p-button-text" />

<!-- Form inputs -->
<FloatLabel variant="on">
    <label for="field">Label</label>
    <InputText id="field" v-model="value" />
</FloatLabel>

<!-- Dialogs -->
<Dialog v-model:visible="visible" header="Title" modal>
    <div class="flex flex-col gap-4"><!-- Content --></div>
    <template #footer><!-- Buttons --></template>
</Dialog>
```

### Icon System

**PrimeIcons** - Format: `pi pi-[icon-name]`
```vue
<i class="pi pi-home"></i>
<Button icon="pi pi-check" />
```

Common icons: `pi-home`, `pi-file`, `pi-folder`, `pi-trash`, `pi-pencil`, `pi-plus`, `pi-check`, `pi-times`, `pi-sun`, `pi-moon`, `pi-search`, `pi-upload`, `pi-download`

### Styling

**Tailwind CSS 4** for layout and utilities:
```vue
<div class="flex flex-col gap-4">
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
<div class="px-6 pt-5 pb-6">
<span class="text-sm text-gray-500">
```

**Breakpoints:** sm (640px), md (768px), lg (1024px)

**CSS Layer Order:** `theme, base, primevue`

### Asset Imports
```typescript
import logoImage from "@/assets/images/logo.svg";
```

### Component Structure
- Use `<script setup lang="ts">` with Composition API
- Use `<style scoped>` for component styles
- Support dark mode with `html.dark` selectors
- Place new components in appropriate `src/components/` subdirectory

### Testing Requirements

**All new functionality MUST be covered by tests.**

Testing setup:
- **Framework**: Vitest with jsdom environment
- **Component testing**: Vue Test Utils
- **Test location**: Place tests in `__tests__` directory next to the file being tested
  - Services: `src/services/__tests__/ServiceName.test.ts`
  - Composables: `src/composables/__tests__/composableName.test.ts`
  - Components: `src/views/path/__tests__/ComponentName.test.ts`

**Test coverage requirements:**
- **Service layer**: Test all API calls with mocked axios client
- **Composable layer**: Test state management, mutations, and side effects
  - Verify query invalidation after mutations
  - Verify local state updates (optimistic updates)
  - Test both success and error paths
- **Component layer**: Test rendering, user interactions, and UI state changes
  - Verify initial render states (loading, empty, populated)
  - Verify UI updates after user actions (clicks, form submissions)
  - Test conditional rendering based on data
  - Verify event handlers are called with correct parameters

**Important patterns:**
- Use `flushPromises()` from `@vue/test-utils` to wait for async operations in component tests
- Use `ref()` from Vue when mocking reactive values in tests
- Mock composables at the module level with `vi.mock()`
- Mutations should update local state immediately for optimistic UI updates
- Always verify both the API call AND the local state change

**Running tests:**
- `npm test` - Run all tests
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Generate coverage report

### Coding Guidelines

**General:**
- Avoid useless comments that simply describe what the code does; if comments are necessary, explain why something is done a certain way
- Always check existing patterns before implementing new features (query library version, service patterns, etc.)

**API Integration:**
- All API endpoints must include the `/api/` prefix
- Services should extend `ApiService<T>` and use `this.apiClient` directly
- Match the `ApiResponse<T>` format: `{ status: string, data: T }`
- Don't make assumptions about backend data structures - check API docs or backend source at `/evo/Work/dms`

**State Management:**
- We always assume optimistic API requests and provide immediate feedback to the user. After a create/update/delete, the UI must reflect the change instantly (update the query cache in `onSuccess` or `onMutate`) rather than waiting for a refetch.
- Composables using `vue-query` should follow the existing pattern in `useComments` and `useDocuments`
- Use `queryClient.fetchQuery` for data fetching, not `useQuery` hooks
- Store data in `ref()` and update it after fetching
- Implement optimistic updates: mutate local state immediately, then invalidate queries
- Always invalidate relevant queries after mutations

**When implementing new features:**
1. Check API docs first: `curl http://localhost:8080/v3/api-docs`
2. **If API spec is unclear or incomplete (missing enums, ambiguous types, etc.) - ASK the user for clarification. Never make assumptions about data structures, enum values, or business logic.**
3. Review similar existing implementations
4. Create types based on actual API responses
5. Create service with all API methods
6. Create composable with state management
7. Update/create UI components
8. Write comprehensive tests for all layers
9. **Document the feature in `docs/features/`** — describe what the component does, how users interact with it, and what functionality it provides. Update `FEATURES_STATUS.md` accordingly.
10. Verify the feature works end-to-end

**Critical: ASK, don't assume**
- When enum values are not documented, ask for the actual values
- When data structures are unclear, ask for examples
- When business logic is ambiguous, ask for clarification
- It's better to ask and get it right than to implement based on wrong assumptions
