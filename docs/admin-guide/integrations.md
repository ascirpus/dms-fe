# Integrations

CedarStack provides programmatic access to your workspace through APIs and integrations.

*Requires: Team plan or higher.*

## REST API

CedarStack exposes a REST API that mirrors all functionality available in the web interface. API access requires authentication via a Bearer token (JWT) obtained from Keycloak.

### Authentication

All API requests must include:

1. **Authorization header** with a valid JWT: `Authorization: Bearer <token>`
2. **X-Tenant-Id header** identifying the workspace: `X-Tenant-Id: <tenant-uuid>`

### Base URL

The API is available at your instance's base URL under `/api/`. For example:

```
https://your-instance.com/api/projects
```

### Key Endpoints

| Category | Base Path | Operations |
|----------|-----------|------------|
| Projects | `/api/projects` | List, create, get, delete |
| Documents | `/api/projects/{projectId}/documents` | List, upload, get, delete, download |
| Approvals | `/api/projects/{projectId}/documents/{documentId}/approve` | Approve, decline, list approvals |
| Signatures | `/api/projects/{projectId}/documents/{documentId}/sign` | Sign, assign signers, get status |
| Comments | `/api/projects/{projectId}/documents/{documentId}/comments` | Add, list, resolve |
| Parties | `/api/projects/{projectId}/party` | CRUD, manage members, set permissions |
| Search | `/api/search` | Full-text search with optional project filter |
| Document Types | `/api/document-types` | List, create, update, delete |
| Tenants | `/api/tenants` | List workspaces, get current, manage invites |
| Users | `/api/users` | Register, create, join via invite |
| Profile | `/api/me` | Get/update profile, set active tenant |
| Notifications | `/api/notifications` | List, mark read, unread count |
| Permissions | `/api/projects/{projectId}/documents/{documentId}/user-permissions` | Get/set/remove user overrides |

### Response Format

All responses are wrapped in a standard format:

```json
{
  "status": "success",
  "data": { ... }
}
```

## MCP Integration (AI Agents)

*Planned: Q2 2026*
*Requires: Team plan or higher.*

CedarStack includes an **MCP (Model Context Protocol) server** that allows AI agents (like Claude) to interact with your documents programmatically.

The MCP server (`dms-mcp-server/`) provides tools for AI agents to:

- Browse projects and documents
- Read document content (OCR-extracted text)
- Search across documents
- Access document metadata and approval status

### Document Content API

The content endpoint returns extracted text from documents:

```
GET /api/projects/{projectId}/documents/{documentId}/content
```

Response includes:
- Extracted text content
- Language detection
- MIME type
- Page count
- Extraction status

This is powered by Apache Tika for text extraction from PDFs and other document formats.

## Webhooks

*Planned: Q2 2026*

Webhook support will notify external systems when events occur in your workspace (document added, approved, signed, etc.).

## Email Notifications

CedarStack sends email notifications for important events. Email delivery:

- Batched with a 15-minute delay to reduce noise
- Sent from the configured `noreply@` address
- Includes deadline reminders at 7, 3, and 1 days before deadlines

Users can configure their email notification preferences per event type in their profile settings.
