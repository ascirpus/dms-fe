# CedarStack DMS - Feature Documentation

This directory contains UX feature documentation for the CedarStack Document Management System frontend. Each document describes what a feature does, how users interact with it, and what functionality is available.

## Feature Index

| Feature | Description | Status |
|---------|-------------|--------|
| [Authentication](features/authentication.md) | Keycloak SSO login, session management, logout | Implemented |
| [Projects](features/projects.md) | Create, list, delete, and navigate projects | Implemented |
| [Project Settings](features/project-settings.md) | Manage parties, members, and document permissions | Implemented |
| [Document Upload](features/document-upload.md) | Upload PDFs to projects with document type selection | Implemented |
| [Document Viewer](features/document-viewer.md) | View PDFs with annotations, comments, and version history | Implemented |
| [Comments & Annotations](features/comments.md) | Add position-based comments on PDF pages | Implemented |
| [Search](features/search.md) | Full-text search across documents and projects | Implemented |
| [Notifications](features/notifications.md) | In-app notifications with email preferences | Implemented |
| [User Profile](features/profile.md) | View and edit user information | Implemented |
| [Tenant Settings](features/tenant-settings.md) | Manage organization-level settings and document types | Implemented |
| [Dark Mode](features/dark-mode.md) | Toggle between light and dark themes | Implemented |
| [Landing Page](features/landing-page.md) | Public marketing page with pricing and feature overview | Implemented |

## How to Use These Docs

- **For UX/Design:** Each doc describes the current user-facing behavior, interactions, and UI elements. Use these as the source of truth when redesigning screens.
- **For User Guides:** Each doc is structured to map directly to user guide sections.
- **For Development:** When modifying a feature, update its doc to reflect the new behavior.

## Conventions

- **Route** indicates the URL path where the feature lives
- **Components** lists the Vue components involved
- **User Interactions** describes what the user can do
- **States** describes loading, empty, and error states
