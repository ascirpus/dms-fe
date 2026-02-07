# DMS Frontend Feature Status

**Last Updated:** 2026-02-06

This document tracks the implementation status of features between the backend (documented in `/evo/Work/dms/docs/FEATURES.md`) and the frontend application.

For detailed UX documentation of each feature (what it does, how to interact with it), see [`docs/features/`](docs/features/).

---

## Legend

- ✅ **Implemented** - Working code with comprehensive tests
- 🔶 **Code Only** - Working code but no/insufficient tests
- ⚠️ **Partial** - Partially implemented or incomplete UI
- ❌ **Not Implemented** - Backend feature exists but no frontend implementation

---

## Test Coverage Summary

**Test Files:** 22 (21 passing, 1 failing — Header.test.ts needs VueQuery plugin fix)
**Total Tests:** 243 (224 passing, 19 failing — all failures in Header.test.ts)

---

## Core Features

### Authentication

| Feature | Backend Status | Frontend Status | Notes |
|---------|----------------|-----------------|-------|
| Keycloak SSO Login | ✅ Live | ✅ Implemented | Keycloak-only auth, no direct login form. Tests: `useAuth.test.ts` (7), `useAuth.interceptors.test.ts` (8) |
| Token Refresh | ✅ Live | ✅ Implemented | Automatic refresh via Keycloak adapter, 401 retry with dedup |
| Tenant Resolution | ✅ Live | ✅ Implemented | Race condition fixed — tenant resolves in router guard before any content renders. Tests: `TenantService.test.ts` |
| Logout | ✅ Live | ✅ Implemented | Always goes through Keycloak logout endpoint |

**Recent changes:** Auth refactored (2026-02-06) — removed direct login form, removed jwt-decode, Keycloak-only tokens, fixed tenant init race.

---

### Document Management

| Feature | Backend Status | Frontend Status | Notes |
|---------|----------------|-----------------|-------|
| Upload & Store | ✅ Live | ✅ Implemented | Upload dialog in ProjectDetail. Tests: `DocumentsService.test.ts` (6), `ProjectsService.test.ts` (19) |
| Organize by Project | ✅ Live | ✅ Implemented | Full CRUD. Tests: `ProjectsService.test.ts` (19), `useProjects.test.ts` (18), `ProjectList.test.ts`, `NewProjectDialog.test.ts` |
| Document Types | ✅ Live | ✅ Implemented | Type selector in upload, management in tenant settings. Tests: `DocumentTypesService.test.ts` (12), `useDocumentTypes.test.ts` (9) |
| File Versioning | ✅ Live (Pro+) | ⚠️ Partial | Version history displayed, "Add Version" upload works. Feature-gated via `useTenantFeatures`. Tests: `useTenantFeatures.test.ts` |
| Download & Preview | ✅ Live | 🔶 Code Only | PDF preview in DocumentViewer. No component tests for viewer. |

---

### Collaboration

| Feature | Backend Status | Frontend Status | Notes |
|---------|----------------|-----------------|-------|
| Comments | ✅ Live | 🔶 Code Only | Full comment system in `useComments`, `CommentTable`. No tests for comments layer. |
| Annotations | ✅ Live | 🔶 Code Only | Position-based markers via `Markers.vue`. No tests. |
| Comment Resolution | ✅ Live | 🔶 Code Only | Resolve/unresolve works. No tests. |

**Gaps:** `CommentsService.test.ts`, `useComments.test.ts`, `CommentTable.test.ts`, `Markers.test.ts` all missing.

---

### Search

| Feature | Backend Status | Frontend Status | Notes |
|---------|----------------|-----------------|-------|
| Full-text Search | ✅ Live | ✅ Implemented | Search across projects or scoped to one project. Tests: `SearchService.test.ts`, `useSearch.test.ts` (12), `SearchResults.test.ts` |

---

### Approval Workflow

| Feature | Backend Status | Frontend Status | Notes |
|---------|----------------|-----------------|-------|
| Document Approval | ✅ Live | ⚠️ Partial | "Confirm Version" button in viewer calls approve endpoint. No dedicated approval UI. |
| Approval Thresholds | ✅ Live | ❌ Not Implemented | No configuration UI |
| Decline with Reason | ✅ Live | ❌ Not Implemented | No decline button or reason dialog |
| Approval Deadlines | ✅ Live | ❌ Not Implemented | No deadline setting UI |

---

### Digital Signatures

| Feature | Backend Status | Frontend Status | Notes |
|---------|----------------|-----------------|-------|
| Signature Requests | ✅ Live | ❌ Not Implemented | No UI for assigning signers |
| Voluntary Signatures | ✅ Live | ❌ Not Implemented | No "sign document" button |
| Signature Tracking | ✅ Live | ❌ Not Implemented | No signature history view |
| Signature Deadlines | ✅ Live | ❌ Not Implemented | No deadline setting |

---

### Team Management

| Feature | Backend Status | Frontend Status | Notes |
|---------|----------------|-----------------|-------|
| Party Management | ✅ Live | ✅ Implemented | Full CRUD in ProjectSettings: create/edit/delete parties with metadata. Tests: `ProjectSettings.test.ts` |
| Member Management | ✅ Live | ✅ Implemented | Add/remove members to parties. Tests: `ProjectSettings.test.ts` |
| Document Permissions | ✅ Live | ✅ Implemented | Per-document-type permissions (View/Comment/Decide) per party. Tests: `ProjectSettings.test.ts` |
| User Invitations | ✅ Live | ⚠️ Partial | "Invite User" button exists in viewer but no implementation |
| Role-Based Access | ✅ Live | ⚠️ Partial | Roles visible in profile, no management UI |
| Tenant User List | ✅ Live | ✅ Implemented | Used in member management. Tests: `UsersService.test.ts` |

---

### Multi-Tenancy

| Feature | Backend Status | Frontend Status | Notes |
|---------|----------------|-----------------|-------|
| Organization Workspaces | ✅ Live | ✅ Implemented | Tenant isolation via X-Tenant-ID header. Tests: `TenantService.test.ts` |
| Tenant Features | ✅ Live | ✅ Implemented | Feature flags (e.g., versioning). Tests: `useTenantFeatures.test.ts` |
| Tiered Plans | ✅ Live | ⚠️ Partial | Plans displayed on landing page only |
| Usage Tracking | ✅ Live | ❌ Not Implemented | No UI |

---

## Frontend-Only Features

| Feature | Status | Notes |
|---------|--------|-------|
| Landing Page | 🔶 Code Only | Marketing page with features, pricing, permissions diagram. No tests. |
| Notification System | ✅ Implemented | Full coverage: `NotificationsService.test.ts`, `useNotifications.test.ts` (9), `Notifications.test.ts` |
| Password Recovery | 🔶 Code Only | Email-based password reset page. No tests. |
| Account Setup | 🔶 Code Only | First-time account completion page. No tests. |
| User Profile | 🔶 Code Only | View/edit user info. No tests. |
| Dark Mode | 🔶 Code Only | Theme switching via header toggle, system preference detection. No tests. |
| Tenant Settings | ✅ Implemented | Document type management. Tests: `TenantSettings.test.ts` (4) |
| Project Settings | ✅ Implemented | Parties, members, permissions management. Tests: `ProjectSettings.test.ts` |

---

## Test Files Inventory

### Passing (21 files, 224 tests)

| Test File | Tests | Covers |
|-----------|-------|--------|
| `services/__tests__/ProjectsService.test.ts` | 19 | Project CRUD API calls |
| `composables/__tests__/useProjects.test.ts` | 18 | Project state management |
| `services/__tests__/DocumentTypesService.test.ts` | 12 | Document types API |
| `composables/__tests__/useSearch.test.ts` | 12 | Search state management |
| `composables/__tests__/useNotifications.test.ts` | 9 | Notification state |
| `composables/__tests__/useDocumentTypes.test.ts` | 9 | Document types state |
| `composables/__tests__/useAuth.interceptors.test.ts` | 8 | Auth interceptors, 401 retry, dedup |
| `composables/__tests__/useAuth.test.ts` | 7 | Auth composable (tenant, user, initials) |
| `services/__tests__/DocumentsService.test.ts` | 6 | Document API calls |
| `composables/__tests__/useTenantFeatures.test.ts` | — | Feature flags |
| `services/__tests__/SearchService.test.ts` | — | Search API |
| `services/__tests__/TenantService.test.ts` | — | Tenant API |
| `services/__tests__/UsersService.test.ts` | — | Users API |
| `services/__tests__/NotificationsService.test.ts` | — | Notifications API |
| `views/user/__tests__/Notifications.test.ts` | — | Notifications UI |
| `views/project/__tests__/ProjectList.test.ts` | — | Project list UI |
| `views/project/__tests__/ProjectSettings.test.ts` | — | Project settings UI |
| `views/search/__tests__/SearchResults.test.ts` | — | Search results UI |
| `views/settings/__tests__/TenantSettings.test.ts` | 4 | Tenant settings UI |
| `components/project/__tests__/NewProjectDialog.test.ts` | — | New project dialog |
| `utils/__tests__/avatar.test.ts` | — | Avatar utility |

### Failing (1 file, 19 tests)

| Test File | Issue |
|-----------|-------|
| `components/base/__tests__/Header.test.ts` | Missing VueQuery plugin in test setup. Pre-existing issue. |

---

## Remaining Gaps

### Missing Tests (Code exists, needs tests)

- `CommentsService` + `useComments` + `CommentTable` + `Markers`
- `DocumentViewer` component
- `PDFWrapper` + `Controls` components
- `HomeView` (landing page)
- `Profile` view
- `PasswordRecovery` + `CompleteAccountSetup` views

### Missing Features (Backend exists, no frontend)

- **Approval Workflow** — Full UI needed: request approval, approve/decline with reason, deadlines, status tracking
- **Digital Signatures** — Full UI needed: request signatures, sign, track, deadlines
- **User Management** — Invite users, manage roles at tenant level
- **Billing / Subscription** — Plan management, usage dashboard
- **Limit Enforcement** — Warnings when approaching tier limits
- **OCR Processing** — Enterprise feature, no UI
- **Advanced Reporting** — Enterprise feature, no UI

### Technical Debt

- Header.test.ts needs VueQuery plugin fix (19 failing tests)
- Profile update has no backend integration (form exists, save is a no-op)
- "Invite User" button in DocumentViewer has no implementation
- Login.vue deleted — password recovery and account setup still reference direct auth flows

---

## Priority Roadmap

### Immediate

1. Fix Header.test.ts (VueQuery plugin setup)
2. Add comments layer tests (CommentsService, useComments, CommentTable, Markers)
3. Add DocumentViewer component tests

### Next

4. Approval Workflow UI
5. User management at tenant level
6. Digital Signatures UI

### Future

7. Billing / subscription management
8. Usage dashboard with limit enforcement
9. OCR processing UI
10. Advanced reporting
