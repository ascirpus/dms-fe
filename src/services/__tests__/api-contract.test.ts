import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * API Contract Test
 *
 * Validates that all frontend service endpoints exist in the backend OpenAPI spec.
 * This prevents endpoint mismatches where unit tests pass (because they mock everything)
 * but the actual API calls would fail at runtime.
 *
 * To update the spec:
 *   curl http://localhost:8080/v3/api-docs > api-docs.json
 *
 * When adding new service endpoints, add them to FRONTEND_ENDPOINTS below.
 */

const spec = JSON.parse(
  readFileSync(resolve(__dirname, '../../../api-docs.json'), 'utf-8'),
);

function getSpecEndpoints(): Map<string, Set<string>> {
  const endpoints = new Map<string, Set<string>>();
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    const methods = new Set<string>();
    for (const method of Object.keys(pathItem as object)) {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        methods.add(method);
      }
    }
    endpoints.set(path, methods);
  }
  return endpoints;
}

function pathMatchesSpec(frontendPath: string, specPath: string): boolean {
  const frontendSegments = frontendPath.split('/');
  const specSegments = specPath.split('/');
  if (frontendSegments.length !== specSegments.length) return false;
  return specSegments.every(
    (seg, i) => seg.startsWith('{') || seg === frontendSegments[i],
  );
}

interface Endpoint {
  service: string;
  method: string;
  path: string;
}

/**
 * All HTTP endpoints called from frontend services and composables.
 *
 * Paths use OpenAPI-style {param} syntax (not JS template literals).
 * Each entry maps to one axios call in the source code.
 */
const FRONTEND_ENDPOINTS: Endpoint[] = [
  // CommentsService.ts
  { service: 'CommentsService', method: 'get', path: '/api/projects/{projectId}/documents/{documentId}/comments' },
  { service: 'CommentsService', method: 'post', path: '/api/projects/{projectId}/documents/{documentId}/comments' },
  { service: 'CommentsService', method: 'post', path: '/api/projects/{projectId}/documents/{documentId}/comments/{commentId}/resolve' },

  // DocumentsService.ts
  { service: 'DocumentsService', method: 'get', path: '/api/projects/{projectId}/documents/{documentId}' },
  { service: 'DocumentsService', method: 'post', path: '/api/projects/{projectId}/documents/{documentId}/approve' },
  { service: 'DocumentsService', method: 'post', path: '/api/projects/{projectId}/documents' },

  // DocumentTypesService.ts
  { service: 'DocumentTypesService', method: 'get', path: '/api/document-types' },
  { service: 'DocumentTypesService', method: 'get', path: '/api/document-types/{id}' },
  { service: 'DocumentTypesService', method: 'post', path: '/api/document-types' },
  { service: 'DocumentTypesService', method: 'put', path: '/api/document-types/{id}' },
  { service: 'DocumentTypesService', method: 'delete', path: '/api/document-types/{id}' },

  // NotificationsService.ts
  { service: 'NotificationsService', method: 'get', path: '/api/notifications' },
  { service: 'NotificationsService', method: 'get', path: '/api/notifications/unread-count' },
  { service: 'NotificationsService', method: 'post', path: '/api/notifications/{notificationId}/read' },
  { service: 'NotificationsService', method: 'post', path: '/api/notifications/read-all' },
  { service: 'NotificationsService', method: 'get', path: '/api/me' },
  { service: 'NotificationsService', method: 'put', path: '/api/me' },

  // ProjectsService.ts
  { service: 'ProjectsService', method: 'get', path: '/api/projects' },
  { service: 'ProjectsService', method: 'get', path: '/api/projects/{projectId}' },
  { service: 'ProjectsService', method: 'get', path: '/api/projects/{projectId}/documents' },
  { service: 'ProjectsService', method: 'post', path: '/api/projects' },
  { service: 'ProjectsService', method: 'delete', path: '/api/projects/{projectId}' },
  { service: 'ProjectsService', method: 'get', path: '/api/projects/{projectId}/members' },

  // RegistrationService.ts
  { service: 'RegistrationService', method: 'post', path: '/api/users/register' },

  // SearchService.ts
  { service: 'SearchService', method: 'get', path: '/api/search' },

  // TenantService.ts
  { service: 'TenantService', method: 'get', path: '/api/tenants/current' },
  { service: 'TenantService', method: 'get', path: '/api/tenants' },
  { service: 'TenantService', method: 'put', path: '/api/me/active-tenant' },
  { service: 'TenantService', method: 'post', path: '/api/tenants' },

  // UsersService.ts
  { service: 'UsersService', method: 'get', path: '/api/tenants/current/users' },

  // useAuth.ts (direct API calls in composable)
  { service: 'useAuth', method: 'get', path: '/api/me' },
  { service: 'useAuth', method: 'put', path: '/api/me' },
  { service: 'useAuth', method: 'get', path: '/api/tenants' },
  { service: 'useAuth', method: 'put', path: '/api/me/active-tenant' },

  // BillingService.ts
  { service: 'BillingService', method: 'get', path: '/api/billing/status' },
  { service: 'BillingService', method: 'get', path: '/api/billing/plans' },
  { service: 'BillingService', method: 'post', path: '/api/billing/checkout' },
  { service: 'BillingService', method: 'post', path: '/api/billing/portal' },
  { service: 'BillingService', method: 'post', path: '/api/billing/cancel' },
];

describe('API Contract', () => {
  const specEndpoints = getSpecEndpoints();

  function findInSpec(method: string, path: string) {
    return Array.from(specEndpoints.entries()).find(
      ([specPath, methods]) =>
        pathMatchesSpec(path, specPath) && methods.has(method),
    );
  }

  const services = [...new Set(FRONTEND_ENDPOINTS.map((e) => e.service))];

  for (const service of services) {
    describe(service, () => {
      const endpoints = FRONTEND_ENDPOINTS.filter(
        (e) => e.service === service,
      );

      for (const endpoint of endpoints) {
        it(`${endpoint.method.toUpperCase()} ${endpoint.path}`, () => {
          const match = findInSpec(endpoint.method, endpoint.path);
          expect(
            match,
            `Endpoint not found in OpenAPI spec. Either the backend doesn't implement this route, or the frontend path is wrong.`,
          ).toBeTruthy();
        });
      }
    });
  }

  it('should have registered all endpoints (sanity check)', () => {
    expect(FRONTEND_ENDPOINTS.length).toBeGreaterThan(0);
  });
});
