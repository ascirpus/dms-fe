# DMS Backend API Reference (auto-generated)

## Document Types

### GET `/api/document-types`
List document types
**Response 200:** `ApiResponseListDocumentTypeDTO`

### POST `/api/document-types`
Create document type
**Request:** `CreateDocumentTypeRequest`
**Response 201:** `ApiResponseDocumentTypeDTO`
**Response 400:** `ApiResponseDocumentTypeDTO`

### GET `/api/document-types/{documentTypeId}`
Get document type
**Response 404:** `ApiResponseDocumentTypeDTO`
**Response 200:** `ApiResponseDocumentTypeDTO`

### PUT `/api/document-types/{documentTypeId}`
Update document type
**Request:** `UpdateDocumentTypeRequest`
**Response 404:** `ApiResponseDocumentTypeDTO`
**Response 200:** `ApiResponseDocumentTypeDTO`

### DELETE `/api/document-types/{documentTypeId}`
Delete document type
**Response 200:** `ApiResponseUnit`
**Response 404:** `ApiResponseUnit`
**Response 400:** `ApiResponseUnit`

## Documents

### GET `/api/projects/{projectId}/documents`
List project documents
**Response 200:** `ApiResponseListDocumentDTO`

### POST `/api/projects/{projectId}/documents`
Create document
**Response 201:** `ApiResponseUnit`
**Response 403:** `ApiResponseUnit`

### GET `/api/projects/{projectId}/documents/{documentId}`
Get document
**Response 403:** `ApiResponseDocumentDTO`
**Response 200:** `ApiResponseDocumentDTO`
**Response 404:** `ApiResponseDocumentDTO`

### DELETE `/api/projects/{projectId}/documents/{documentId}`
Delete document
**Response 404:** `ApiResponseUnit`
**Response 200:** `ApiResponseUnit`

### GET `/api/projects/{projectId}/documents/{documentId}/approvals`
Get approvals
**Response 200:** `ApiResponseListDocumentApprovalDTO`

### POST `/api/projects/{projectId}/documents/{documentId}/approve`
Approve document
**Response 403:** `ApiResponseUnit`
**Response 200:** `ApiResponseUnit`

### GET `/api/projects/{projectId}/documents/{documentId}/comments`
Get comments
**Response 200:** `ApiResponseListCommentResponseDTO`
**Response 403:** `ApiResponseListCommentResponseDTO`

### POST `/api/projects/{projectId}/documents/{documentId}/comments`
Add comment
**Request:** `CommentRequest`
**Response 403:** `ApiResponseCommentResponseDTO`
**Response 201:** `ApiResponseCommentResponseDTO`

### POST `/api/projects/{projectId}/documents/{documentId}/comments/{commentId}/resolve`
Resolve comment
**Response 403:** `ApiResponseUnit`
**Response 404:** `ApiResponseUnit`
**Response 200:** `ApiResponseUnit`

### PATCH `/api/projects/{projectId}/documents/{documentId}/deadline`
Extend approval deadline
**Request:** `ExtendDeadlineRequest`
**Response 200:** `ApiResponseUnit`
**Response 403:** `ApiResponseUnit`
**Response 400:** `ApiResponseUnit`

### POST `/api/projects/{projectId}/documents/{documentId}/decline`
Decline document
**Request:** `DeclineRequest`
**Response 403:** `ApiResponseUnit`
**Response 200:** `ApiResponseUnit`

### GET `/api/projects/{projectId}/documents/{documentId}/files/{fileId}`
Get file

### PATCH `/api/projects/{projectId}/documents/{documentId}/required-approvals`
Update required approvals
**Request:** `UpdateRequiredApprovalsRequest`
**Response 200:** `ApiResponseUnit`
**Response 400:** `ApiResponseUnit`
**Response 403:** `ApiResponseUnit`

### POST `/api/projects/{projectId}/documents/{documentId}/sign`
Sign document (requires DECIDE permission, document must be APPROVED)
**Response 200:** `ApiResponseUnit`
**Response 400:** `ApiResponseUnit` (document not approved or signature not required)
**Response 403:** `ApiResponseUnit`

### GET `/api/projects/{projectId}/documents/{documentId}/signatures`
Get signatures
**Response 200:** `ApiResponseSignatureStatusDTO`

## Notification Preferences

### GET `/api/profile/notifications`
Get preferences
**Response 200:** `ApiResponseMapStringChannelPrefs`

### POST `/api/profile/notifications`
Update preferences

## Notifications

### GET `/api/notifications`
List notifications
**Response 200:** `ApiResponseListNotificationResponse`

### POST `/api/notifications/read-all`
Mark all as read

### GET `/api/notifications/unread-count`
Get unread count
**Response 200:** `ApiResponseUnreadCountResponse`

### POST `/api/notifications/{notificationId}/read`
Mark as read

## Parties

### GET `/api/projects/{projectId}/party`
List project parties
**Response 200:** `ApiResponseProjectPartyMembersDTO`

### POST `/api/projects/{projectId}/party`
Create party
**Request:** `CreatePartyRequest`
**Response 200:** `ApiResponsePartyDTO`

### GET `/api/projects/{projectId}/party/permissions`
Get all party permissions
**Response 200:** `ApiResponseListPartyPermissionsDTO`

### DELETE `/api/projects/{projectId}/party/{partyId}`
Delete party
**Response 200:** `ApiResponseUnit`

### GET `/api/projects/{projectId}/party/{partyId}/members`
Get party members
**Response 200:** `ApiResponseListUserDTO`

### POST `/api/projects/{projectId}/party/{partyId}/members`
Add user to party
**Request:** `UpdateUserPartyRequest`
**Response 201:** `ApiResponseUnit`

### DELETE `/api/projects/{projectId}/party/{partyId}/members`
Remove user from party
**Request:** `UpdateUserPartyRequest`
**Response 200:** `ApiResponseUnit`

### POST `/api/projects/{projectId}/party/{partyId}/permission`
Set party permissions
**Request:** `SetPermissionsRequest`

### DELETE `/api/projects/{projectId}/party/{partyId}/permission`
Remove party permissions

## Projects

### GET `/api/projects`
List all projects
**Response 200:** `ApiResponseListProjectWithDocumentCount`

### POST `/api/projects`
Create project
**Request:** `CreateProjectRequest`
**Response 201:** `ApiResponseProjectDTO`

### GET `/api/projects/{projectId}`
Get project
**Response 200:** `ApiResponseProjectDTO`
**Response 404:** `ApiResponseProjectDTO`

### GET `/api/projects/{projectId}/members`
Get project members

## Search

### GET `/api/search`
Search documents
**Response 200:** `ApiResponseListSearchResultDTO`

## Security (Test)

### GET `/secure`
Test secure endpoint
**Response 200:** `ApiResponseString`

### GET `/secure/password/reset`
Reset password
**Response 200:** `ApiResponseString`

### GET `/secure/verify`
Send verification email
**Response 200:** `ApiResponseString`

## Tenant

### GET `/api/tenant`
Get current tenant
**Response 200:** `ApiResponseTenantDTO`
**Response 403:** `ApiResponseTenantDTO`

### GET `/api/tenant/invites`
List pending invites
**Response 200:** `ApiResponseListTenantInviteDTO`

### POST `/api/tenant/invites`
Create invite
**Request:** `CreateInviteRequest`
**Response 201:** `ApiResponseTenantInviteDTO`

### DELETE `/api/tenant/invites/{inviteId}`
Cancel invite
**Response 200:** `ApiResponseUnit`

### GET `/api/tenant/users`
List tenant users
**Response 200:** `ApiResponseListTenantUserDTO`

## User Tenants

### GET `/api/tenants`
List user tenants
**Response 200:** `ApiResponseUserTenantsResponseDTO`

### PUT `/api/tenants/{tenantId}/select`
Select tenant
**Response 403:** `ApiResponseUnit`
**Response 200:** `ApiResponseUnit`

## Users

### POST `/api/users/create`
Create user
**Request:** `CreateUserRequest`
**Response 201:** `ApiResponseUserDTO`

### POST `/api/users/join`
Join tenant via invite
**Request:** `JoinTenantRequest`
**Response 201:** `ApiResponseUserDTO`

### POST `/api/users/register`
Register company
**Request:** `RegisterCompanyRequest`
**Response 201:** `ApiResponseRegistrationResponseDTO`

### DELETE `/api/users/{user}`
Delete user
**Response 200:** `ApiResponseUnit`

---
## Schemas

### Author
- `email`: string **(required)**
- `firstName`: string
- `lastName`: string

### ChannelPrefs
- `web`: boolean **(required)**
- `email`: boolean **(required)**

### CommentRequest
- `fileId`: string **(required)**
- `comment`: string **(required)**
- `marker`: MarkerRequest

### CommentResponseDTO
- `id`: string **(required)**
- `documentId`: string **(required)**
- `fileId`: string **(required)**
- `comment`: string **(required)**
- `marker`: MarkerDTO
- `author`: Author **(required)**
- `isResolved`: boolean **(required)**
- `createdAt`: string (date-time) **(required)**

### CreateDocumentTypeRequest
- `name`: string **(required)**
- `requiresApproval`: boolean **(required)**
- `defaultApprovalThreshold`: integer (int32) **(required)**
- `requiresSignature`: boolean **(required)**
- `defaultPermissions`: integer (int32) **(required)**

### CreateInviteRequest
- `email`: string **(required)**
- `role`: "MEMBER" | "ADMIN" | "OWNER" **(required)**

### CreatePartyRequest
- `name`: string **(required)**
- `description`: string
- `meta`: PartyMetaRequest

### CreateProjectRequest
- `name`: string **(required)**
- `description`: string **(required)**

### CreateUserRequest
- `email`: string **(required)**
- `firstName`: string
- `lastName`: string
- `projectId`: string (uuid)

### DeclineRequest
- `comment`: string

### DocumentApprovalDTO
- `id`: string **(required)**
- `userId`: string **(required)**
- `action`: string **(required)**
- `comment`: string
- `createdAt`: string (date-time) **(required)**

### DocumentDTO
- `id`: string **(required)**
- `title`: string **(required)**
- `documentTypeId`: string **(required)**
- `description`: string
- `status`: "APPROVED" | "DECLINED" | "PENDING"
- `currentVersion`: FileDTO
- `versions`: FileVersionDTO[] **(required)**
- `comments`: CommentResponseDTO[] **(required)**
- `approvals`: DocumentApprovalDTO[] **(required)**
- `signatures`: SignatureDTO[] **(required)**
- `requiredApprovals`: integer (int32) **(required)**
- `requiresSignature`: boolean **(required)**
- `isSigned`: boolean **(required)**
- `approvalDeadline`: string (date-time)
- `signatureDeadline`: string (date-time)

### DocumentRequest
- `title`: string **(required)**
- `document_id`: string
- `document_type_id`: string **(required)**
- `description`: string
- `requiredApprovals`: integer (int32)
- `approvalDeadline`: string (date-time)

### DocumentTypeDTO
- `id`: string **(required)**
- `name`: string **(required)**
- `requiresApproval`: boolean **(required)**
- `defaultApprovalThreshold`: integer (int32) **(required)**
- `requiresSignature`: boolean **(required)**
- `defaultPermissions`: integer (int32) **(required)**

### ErrorData
- `code`: string **(required)**
- `message`: string **(required)**
- `details`: object

### ExtendDeadlineRequest
- `deadline`: string (date-time) **(required)**

### FeatureDTO
- `feature`: "DOCUMENT_VERSIONING" | "OCR_PROCESSING" | "API_ACCESS" | "ADVANCED_REPORTING" **(required)**
- `enabled`: boolean **(required)**
- `config`: Map<string, object> **(required)**

### FileDTO
- `id`: string **(required)**
- `filename`: string **(required)**
- `version`: integer (int32) **(required)**
- `uploadedAt`: string (date-time) **(required)**
- `uploadedBy`: string **(required)**

### FileVersionDTO
- `version`: integer (int32) **(required)**
- `fileId`: string **(required)**
- `filename`: string **(required)**
- `uploadedAt`: string (date-time) **(required)**

### JoinTenantRequest
- `email`: string **(required)**
- `tenantId`: string **(required)**
- `firstName`: string
- `lastName`: string

### MarkerDTO
- `id`: string **(required)**
- `pageNumber`: integer (int32) **(required)**
- `position`: Position **(required)**

### MarkerRequest
- `pageNumber`: integer (int32) **(required)**
- `position`: Position **(required)**

### NotificationResponse
- `id`: string **(required)**
- `type`: string **(required)**
- `projectId`: string
- `documentId`: string
- `createdAt`: string **(required)**
- `read`: boolean **(required)**

### PartyDTO
- `id`: string **(required)**
- `name`: string **(required)**
- `description`: string
- `meta`: PartyMetaDTO **(required)**
- `createdAt`: string (date-time) **(required)**

### PartyMetaDTO
- `contactEmail`: string
- `contactPhone`: string
- `vatNumber`: string
- `address`: string

### PartyMetaRequest
- `contactEmail`: string
- `contactPhone`: string
- `vatNumber`: string
- `address`: string

### PartyPermissionsDTO
- `partyId`: string **(required)**
- `permissions`: Map<string, "VIEW" | "COMMENT" | "DECIDE"> **(required)**

### PartyWithMembersDTO
- `party`: PartyDTO **(required)**
- `members`: UserDTO[] **(required)**

### Position
- `x`: integer (int32) **(required)**
- `y`: integer (int32) **(required)**

### ProjectDTO
- `id`: string **(required)**
- `name`: string **(required)**
- `description`: string

### ProjectPartyMembersDTO
- `projectId`: string **(required)**
- `parties`: PartyWithMembersDTO[] **(required)**

### ProjectSummary
- `id`: string (uuid) **(required)**
- `name`: string **(required)**
- `description`: string

### ProjectWithDocumentCount
- `project`: ProjectSummary **(required)**
- `document_count`: integer (int32) **(required)**

### RegisterCompanyRequest
- `email`: string **(required)**
- `companyName`: string **(required)**
- `firstName`: string
- `lastName`: string

### RegistrationResponseDTO
- `user`: UserDTO **(required)**
- `tenantId`: string **(required)**

### RequireSignaturesRequest
- `userIds`: string[] **(required)**

### SearchResultDTO
- `documentId`: string **(required)**
- `projectId`: string **(required)**
- `projectName`: string **(required)**
- `title`: string **(required)**
- `documentTypeId`: string **(required)**
- `snippet`: string
- `rank`: number (double) **(required)**

### SetPermissionsRequest
- `permissions`: Map<string, "VIEW" | "COMMENT" | "DECIDE"> **(required)**

### SignatureDTO
- `user`: UserDTO **(required)**
- `signedAt`: string (date-time) **(required)**
- `contentHash`: string **(required)**

### SignatureStatusDTO
- `signatures`: SignatureDTO[] **(required)**
- `signedCount`: integer (int32) **(required)**

### TenantDTO
- `id`: string **(required)**
- `name`: string **(required)**
- `tier`: TierDTO **(required)**
- `usage`: TenantUsageDTO **(required)**
- `createdAt`: string (date-time) **(required)**

### TenantInviteDTO
- `id`: string **(required)**
- `email`: string **(required)**
- `invitedBy`: string **(required)**
- `role`: "MEMBER" | "ADMIN" | "OWNER" **(required)**
- `expiresAt`: string (date-time) **(required)**
- `createdAt`: string (date-time) **(required)**

### TenantUsageDTO
- `projectsCount`: integer (int32) **(required)**
- `documentsCount`: integer (int32) **(required)**
- `storageUsedMb`: integer (int64) **(required)**

### TenantUserDTO
- `userId`: string **(required)**
- `firstName`: string
- `lastName`: string
- `email`: string **(required)**
- `role`: "MEMBER" | "ADMIN" | "OWNER" **(required)**
- `createdAt`: string (date-time) **(required)**

### TierDTO
- `id`: string **(required)**
- `name`: string **(required)**
- `maxProjects`: integer (int32)
- `maxDocumentsPerProject`: integer (int32)
- `maxStorageMb`: integer (int64)
- `maxDocumentSizeMb`: integer (int64)
- `maxUsersPerProject`: integer (int32)
- `features`: FeatureDTO[] **(required)**

### UnreadCountResponse
- `count`: integer (int32) **(required)**

### UpdateDocumentTypeRequest
- `name`: string
- `requiresApproval`: boolean
- `defaultApprovalThreshold`: integer (int32)
- `requiresSignature`: boolean
- `defaultPermissions`: integer (int32)

### UpdateRequiredApprovalsRequest
- `requiredApprovals`: integer (int32) **(required)**

### UpdateUserPartyRequest
- `user_id`: string (uuid) **(required)**

### UserDTO
- `id`: string **(required)**
- `email`: string **(required)**
- `firstName`: string **(required)**
- `lastName`: string **(required)**

### UserTenantSummaryDTO
- `tenantId`: string **(required)**
- `name`: string **(required)**
- `role`: "MEMBER" | "ADMIN" | "OWNER" **(required)**
- `createdAt`: string (date-time) **(required)**

### UserTenantsResponseDTO
- `tenants`: UserTenantSummaryDTO[] **(required)**
- `lastAccessedTenantId`: string
