# Document Viewer

## Overview

The document viewer is a full-screen PDF viewing experience with annotation tools, a comment sidebar, version history, and approval/signing workflows. It is the primary interface for reviewing and collaborating on documents.

## Route

`/projects/:id/documents/:documentId`

## Components

- `src/views/project/DocumentViewer.vue` - Main viewer layout
- `src/components/pdf-viewer/PDFWrapper.vue` - PDF rendering with markers
- `src/components/pdf-viewer/Controls.vue` - Page navigation and zoom controls
- `src/components/pdf-viewer/Markers.vue` - Comment position markers on PDF
- `src/components/pdf-viewer/CommentTable.vue` - Comment list sidebar
- `src/components/pdf-viewer/DocumentActionBar.vue` - Approval/signature action bar
- `src/components/pdf-viewer/DeclineDialog.vue` - Decline confirmation dialog
- `src/components/pdf-viewer/ActivityTimeline.vue` - Approval/signature activity timeline

## Layout

### Top Bar

- Logo (links to home)
- "Projects" / "Documents" navigation buttons
- Notification bell icon
- User avatar with dropdown menu (Profile, Sign Out)

### Document Header

- Project name (breadcrumb link back to project)
- Document title
- "Add Version" button (visible when versioning is enabled)
- "Invite User" button

### Document Action Bar

Shown between the header and PDF viewer when the document has an approval workflow or signatures:

- **Approval row** (when `documentType.requiresApproval`):
  - PENDING: Shows "X of Y approvals" progress + [Approve] and [Decline] buttons + optional deadline
  - APPROVED: Green "Approved" badge (no buttons)
  - DECLINED: Red "Declined" badge (no buttons)
- **Signature row** (when signatures exist):
  - Shows "X of Y signatures" (if required) or "X signatures" (if voluntary) + [Sign Document] button + optional deadline
- Hidden for plain documents with no approval workflow and no signatures

### Main Area

- **Left:** PDF viewer taking most of the width. Displays the current page of the PDF with interactive markers overlaid at comment positions.
- **Right sidebar** (toggleable): Three tabs:
  - **Comments tab** - list of all comments on the document
  - **Versions tab** - version history timeline
  - **Activity tab** - chronological timeline of approvals and signatures (only shown when relevant)

### Bottom Toolbar

| Button | Description |
|--------|-------------|
| Show All Comments | Toggle to display all comments |
| Show My Comments | Toggle to display only your comments |
| Show Version History | Toggle the versions sidebar tab |
| Document Info | Show document metadata dialog |
| Download | Opens the PDF file in a new browser tab |
| Print | Triggers browser print dialog |
| Share | Copies the document URL to clipboard |

## User Interactions

### Viewing the PDF

| Action | How | Result |
|--------|-----|--------|
| Navigate pages | Arrow buttons in Controls bar, or scroll | Move between PDF pages |
| Zoom in/out | Zoom controls in Controls bar | Scale the PDF view |
| Download | Click download button | Opens PDF in new tab |
| Print | Click print button | Browser print dialog |
| Share link | Click share button | URL copied to clipboard, toast confirmation |

### Comments & Annotations

| Action | How | Result |
|--------|-----|--------|
| Add comment | Click a position on the PDF page | Opens comment input, marker placed at clicked position |
| View comments | Open the Comments tab in sidebar | List of all comments with author, text, timestamp |
| Jump to comment | Click "Jump to page" on a comment | PDF scrolls to the page and highlights the marker |
| Resolve comment | Click resolve button on a comment | Comment marked as resolved, marker updated |
| Filter comments | Use "Show All" / "Show My Comments" toggles | Filters visible comments |

### Version History

| Action | How | Result |
|--------|-----|--------|
| View versions | Click "Versions" tab in sidebar | Shows version timeline |
| Switch version | Click on a version entry | PDF viewer loads that version's file |
| Upload version | Click "Add Version" button | Opens upload dialog |
| Identify current | Look for "Current" badge | Current/latest version is marked |

Each version entry shows:
- Version number (e.g., "v1", "v2")
- Who uploaded it
- Upload date
- "Current" badge on the active version

### Document Approval

| Action | How | Result |
|--------|-----|--------|
| Approve | Click "Approve" in the action bar | API call, document status updates, toast feedback, activity timeline updated |
| Decline | Click "Decline" in the action bar | Opens decline dialog with optional comment, submits, toast feedback |
| Sign | Click "Sign Document" in the action bar | API call, signature status updates, toast feedback |

The action bar is only shown when the document type has `requiresApproval` or when signatures exist.

### Activity Timeline

The Activity tab in the sidebar shows:
- **Pending section** (top): lists users who still need to sign
- **Completed timeline** (newest first): each entry shows user avatar, action text ("approved this document" / "declined: reason" / "signed this document"), and relative timestamp

### Document Info

Clicking "Document Info" opens a dialog showing:
- Version number
- Added by (uploader name)
- Date uploaded
- Status (Pending / Approved / Declined)
- Description

## Composables

- `useApprovals` (`src/composables/useApprovals.ts`) - Manages approval and signature state using vue-query. Provides `fetchApprovals`, `fetchSignatureStatus`, `approveDocument`, `declineDocument`, `signDocument`.

## States

- **Loading:** Spinner while document and PDF load
- **Viewing:** PDF displayed with controls active
- **Sidebar open:** Comments, versions, or activity panel visible alongside PDF
- **Sidebar closed:** Full-width PDF viewing
- **Error:** Error message if document fails to load
- **Action loading:** Approve/decline/sign buttons show loading state during API calls
