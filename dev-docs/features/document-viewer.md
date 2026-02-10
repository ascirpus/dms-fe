# Document Viewer

## Overview

The document viewer is a full-screen PDF viewing experience with annotation tools, a comment sidebar, and version history. It is the primary interface for reviewing and collaborating on documents.

## Route

`/projects/:id/documents/:documentId`

## Components

- `src/views/project/DocumentViewer.vue` - Main viewer layout
- `src/components/pdf-viewer/PDFWrapper.vue` - PDF rendering with markers
- `src/components/pdf-viewer/Controls.vue` - Page navigation and zoom controls
- `src/components/pdf-viewer/Markers.vue` - Comment position markers on PDF
- `src/components/pdf-viewer/CommentTable.vue` - Comment list sidebar

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

### Main Area

- **Left:** PDF viewer taking most of the width. Displays the current page of the PDF with interactive markers overlaid at comment positions.
- **Right sidebar** (toggleable): Two tabs:
  - **Comments tab** - list of all comments on the document
  - **Versions tab** - version history timeline

### Bottom Toolbar

| Button | Description |
|--------|-------------|
| Show All Comments | Toggle to display all comments |
| Show My Comments | Toggle to display only your comments |
| Show Version History | Toggle the versions sidebar tab |
| Confirm Version | Approve the current document version |
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

### Document Info

Clicking "Document Info" opens a dialog showing:
- Version number
- Added by (uploader name)
- Date uploaded
- Status (Pending / Approved / Declined)
- Description

### Document Approval

- Click "Confirm Version" in the bottom toolbar
- The document status is updated to Approved via the API
- Status change reflected in the document info

## States

- **Loading:** Spinner while document and PDF load
- **Viewing:** PDF displayed with controls active
- **Sidebar open:** Comments or versions panel visible alongside PDF
- **Sidebar closed:** Full-width PDF viewing
- **Error:** Error message if document fails to load
