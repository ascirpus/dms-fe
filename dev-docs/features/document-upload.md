# Document Upload

## Overview

Users can upload PDF documents to a project. The upload dialog allows specifying a title and document type. Documents appear in the project's document table after upload.

## Components

- `src/views/project/ProjectDetail.vue` - Contains the upload trigger and dialog
- `src/services/ProjectsService.ts` - Handles the upload API call

## How It Works

### Upload Flow

1. Navigate to a project detail page (`/projects/:id`)
2. Click the "Upload Document" button
3. A dialog opens with the following fields:
   - **Title** (required) - the document name
   - **Document Type** (required) - dropdown populated from tenant's configured document types
   - **File** (required) - PDF file picker
4. Click "Upload" to submit
5. The document is uploaded via multipart form data to `POST /api/projects/:id/documents`
6. On success, the document appears in the project's document table
7. The dialog closes automatically

### Version Upload

From the Document Viewer, users can upload new versions of an existing document:

1. In the document viewer, click "Add Version" button (only visible if versioning is enabled for the tenant)
2. A dialog opens with a file picker
3. Select a new PDF file
4. The file is uploaded as a new version via `POST /api/projects/:projectId/documents/:documentId/versions`
5. The version history sidebar updates to show the new version
6. The viewer switches to display the newly uploaded version

## User Interactions

| Action | How | Result |
|--------|-----|--------|
| Upload new document | "Upload Document" button on project detail | Opens upload dialog |
| Upload new version | "Add Version" button in document viewer | Opens version upload dialog |
| Select file | Click file input or drag-and-drop | File selected for upload |
| Cancel upload | Click "Cancel" in dialog | Dialog closes, nothing uploaded |

## Constraints

- Only PDF files are supported
- File size limits depend on the tenant's subscription tier
- Document type must be selected from the tenant's configured types

## States

- **Idle:** Upload button enabled, no dialog open
- **Dialog open:** Form visible, awaiting user input
- **Uploading:** Loading indicator on the submit button, form fields disabled
- **Success:** Dialog closes, document appears in table
- **Error:** Error toast notification, dialog remains open for retry
