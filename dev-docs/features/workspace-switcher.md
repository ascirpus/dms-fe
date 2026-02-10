# Workspace Switcher

## Overview

The Workspace Switcher allows users to view and switch between workspaces (tenants) they belong to, directly from the application header. It also provides quick navigation to workspace-scoped settings and usage information.

## Components

### WorkspaceSwitcher (`src/components/base/WorkspaceSwitcher.vue`)

A header dropdown component that sits next to the application logo. Shows the current workspace name with a chevron indicator.

**Interactions:**
- Click the workspace name to open a Popover dropdown
- Current workspace is highlighted with a check icon
- Click another workspace to switch (navigates to `/app/projects` after switch)
- "New Workspace" shows a "Coming Soon" toast (backend endpoint for workspace creation by authenticated users does not exist yet)
- "Workspace Settings" links to the document types management page
- "Usage & Limits" links to the workspace overview page

### WorkspaceOverview (`src/views/workspace/WorkspaceOverview.vue`)

The Usage & Limits page, accessible at `/app/workspace`.

**Sections:**
1. **Heading** — Workspace name with a tier badge (e.g., "Pro", "Enterprise")
2. **Usage & Limits** — Grid of usage cards for Projects, Documents, and Storage. Each shows current/max values with a progress bar
3. **Features** — List of tenant feature flags with enabled/disabled status
4. **Cleanup Suggestions** — Shown only when any usage metric exceeds 80% of its limit. Lists stale projects and documents sorted by oldest activity. Items link to their detail pages for review
5. **Upgrade CTA** — Placeholder card with a "Coming Soon" toast on button click

### WorkspaceSettings (`src/views/workspace/WorkspaceSettings.vue`)

Refactored settings page at `/app/workspace/settings`. Contains the same document type CRUD functionality as the previous TenantSettings, but without the tab navigation. Uses the same vertical section layout as the Profile page.

## Data Flow

### useWorkspace composable (`src/composables/useWorkspace.ts`)

Singleton module-level refs shared across all consumers:
- `currentWorkspace` — Full Tenant object (name, tier, usage, features)
- `userWorkspaces` — All workspaces the user belongs to
- `workspacesLoaded` — Whether workspaces have been fetched

Key operations:
- `fetchWorkspaces()` — Fetches user's workspaces and current workspace data
- `fetchCurrentWorkspace()` — Fetches current tenant data (shares `['tenant']` query key with `useTenantFeatures`)
- `switchWorkspace(tenantId)` — Sets tenant ID, clears all query cache, fetches new workspace, navigates to projects

## Routes

| Path | Route Name | Component |
|------|-----------|-----------|
| `/app/workspace` | `workspace-overview` | WorkspaceOverview.vue |
| `/app/workspace/settings` | `workspace-settings` | WorkspaceSettings.vue |
| `/app/settings` | (redirect) | Redirects to `workspace-settings` |

## Avatar Menu Changes

The "Settings" item was removed from the user avatar dropdown menu. Users now access settings through the WorkspaceSwitcher dropdown instead. The avatar menu only contains "Profile" and "Sign Out".
