# Projects

## Overview

Projects are the top-level organizational unit. Each project contains documents and has its own team members, parties, and permission settings.

## Routes

- `/projects` - Project list
- `/projects/:id` - Project detail (document list)
- `/projects/:id/settings` - Project settings

## Components

- `src/views/project/ProjectList.vue` - Project list page
- `src/views/project/ProjectDetail.vue` - Project detail page
- `src/components/project/NewProjectDialog.vue` - Create project dialog

## Project List (`/projects`)

### What It Shows

A data table of all projects the user has access to, with columns:

| Column | Description |
|--------|-------------|
| Name | Project name (clickable - navigates to project detail) |
| Description | Project description text |
| Documents | Number of documents in the project |

### User Interactions

| Action | How | Result |
|--------|-----|--------|
| View project | Click on a project row | Navigate to `/projects/:id` |
| Create project | Click "New Project" button | Opens NewProjectDialog |
| Edit project | Click pencil icon on row | Navigate to project settings |
| Delete project | Click trash icon on row | Confirmation dialog, then delete |
| Search/filter | Type in the filter input | Filters projects by name or description |
| Change page size | Use pagination dropdown | Show 10, 20, or 50 projects per page |

### New Project Dialog

A modal dialog with:
- **Name** field (required) - the project name
- **Description** field (optional) - project description
- **Create** button - submits the form
- **Cancel** button - closes the dialog

After creation, the new project appears in the list immediately (optimistic update).

### States

- **Loading:** Skeleton/spinner while projects load
- **Empty:** Message prompting user to create their first project, with a "New Project" button
- **Error:** Error message with a "Retry" button
- **Populated:** Data table with projects

## Project Detail (`/projects/:id`)

### What It Shows

The project header (name, description) and a table of documents within the project.

**Document table columns:**

| Column | Visibility | Description |
|--------|-----------|-------------|
| Document Name | Always visible | Document title (clickable) |
| Modified Date | Toggleable | Last modification date |
| Status | Toggleable | Status tag: "Pending" / "{signed}/{total} Signatures" (warn), "Approved" (success), "Declined" (danger) |
| Version | Toggleable | Current version number |

### User Interactions

| Action | How | Result |
|--------|-----|--------|
| View document | Click document row | Navigate to document viewer |
| Upload document | Click "Upload Document" | Opens upload dialog |
| Edit document | Click pencil icon on row | Opens edit dialog (title, status) |
| Delete document | Click trash icon on row | Confirmation dialog, then delete |
| Filter by status | Use status dropdown | Show All, Pending, Approved, or Declined |
| Toggle columns | Click column settings icon | Popover with checkboxes to show/hide columns |
| Search documents | Type in filter input | Filters documents by name |
| Go to settings | Click "Settings" button | Navigate to project settings |

### States

- **Loading:** Spinner while documents load
- **Empty:** Message prompting to upload first document
- **Error:** Error message with retry
- **Populated:** Document data table
