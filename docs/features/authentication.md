# Authentication

## Overview

Authentication is handled entirely through Keycloak SSO. There is no direct username/password login form in the application. Users are redirected to Keycloak for login and returned to the app after successful authentication.

## Components

- `src/composables/useAuth.ts` - Core auth composable
- `src/stores/authStore.ts` - Persists tenant ID and permissions
- `src/composables/useRoutes.ts` - Route guards

## How It Works

### Login Flow

1. User visits a protected route (e.g., `/projects`) or clicks "Get Started" / "Sign In"
2. The route guard detects the user is not authenticated and redirects to the `/login` route
3. The `/login` route triggers `auth.login()`, which redirects the browser to Keycloak's login page
4. User authenticates with Keycloak (username/password, SSO, social login - whatever Keycloak is configured for)
5. Keycloak redirects back to the app with tokens
6. The Keycloak adapter stores tokens in memory (not localStorage)
7. The router guard resolves the user's tenant before any authenticated content renders

### Session Management

- Tokens are managed in-memory by the Keycloak JS adapter
- Before each API request, the token is refreshed if it expires within 60 seconds
- If a 401 response is received, the app attempts one token refresh and retries the request
- If refresh fails, the user is logged out and redirected to Keycloak login

### Tenant Resolution

- After authentication, the app fetches the user's available tenants via `GET /api/tenants`
- If the user has a previously accessed tenant, that one is selected automatically
- Otherwise, the first available tenant is used
- The selected tenant ID is persisted in localStorage so it survives page refreshes
- All API requests include an `X-Tenant-ID` header (except the tenant bootstrap endpoint itself)
- No authenticated UI renders until the tenant is resolved (prevents race conditions)

### Logout

1. User clicks "Sign Out" from the user menu in the header
2. Local state is cleared (tenant ID, permissions)
3. User is redirected to Keycloak's logout endpoint
4. Keycloak clears its session and redirects back to the app origin

## User Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Sign in | Click "Sign In" or visit protected route | Redirect to Keycloak login page |
| Sign out | Click "Sign Out" in header user menu | Clear session, redirect to Keycloak logout |
| Session expired | Automatic on API call | Silent token refresh, or redirect to login if refresh fails |

## Protected Routes

All routes except the following require authentication:
- `/` (Home / Landing page)
- `/login` (triggers Keycloak redirect)
- `/password-recovery`
- `/complete-setup`

## States

- **Unauthenticated:** User sees the landing page. Protected routes redirect to Keycloak.
- **Authenticating:** Brief blank screen while Keycloak check-sso runs and tenant resolves.
- **Authenticated:** Full app layout renders with header, navigation, and content.
