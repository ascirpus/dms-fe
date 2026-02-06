# Tenant Settings

## Overview

Organization-level settings for managing the tenant's configuration and document types. Accessible to users with appropriate permissions.

## Route

`/settings`

## Components

- `src/views/settings/TenantSettings.vue` - Settings page

## What It Shows

The tenant settings page provides management of organization-wide configuration. The primary feature is document type management.

### Document Types

Document types define the categories of documents that can be uploaded to projects. They are used for:
- Categorizing uploads (users select a document type when uploading)
- Party permissions (permissions can be set per document type per party)

The settings page allows:
- Viewing all configured document types
- Adding new document types
- Editing existing document types
- Removing document types

## User Interactions

| Action | How | Result |
|--------|-----|--------|
| View settings | Navigate to `/settings` | Settings page loads |
| View document types | Default view on settings page | List of document types displayed |
| Add document type | Click add button | Opens input for new type name/description |
| Edit document type | Click edit on a type | Opens edit form |
| Delete document type | Click delete on a type | Confirmation, then removes the type |

## Access

Only users with appropriate tenant permissions (typically Admin or Owner roles) should access this page. The route is protected by authentication.

## States

- **Loading:** Spinner while tenant data loads
- **Loaded:** Settings and document types displayed
- **Empty:** No document types configured yet, prompt to add first one
