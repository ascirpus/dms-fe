# Comments & Annotations

## Overview

Comments are position-based annotations on PDF documents. Users can click anywhere on a PDF page to place a marker and attach a comment. Comments are displayed in a sidebar alongside the document and as visual markers on the PDF itself.

## Components

- `src/components/pdf-viewer/CommentTable.vue` - Comment list display
- `src/components/pdf-viewer/Markers.vue` - Visual markers on PDF pages
- `src/composables/useComments.ts` - Comment state management
- `src/services/CommentsService.ts` - Comment API calls

## How Comments Work

### Adding a Comment

1. Open a document in the Document Viewer
2. Click on a position on the PDF page
3. A marker appears at the clicked position
4. A comment input field appears (in the sidebar or inline)
5. Type the comment text
6. Submit the comment
7. The comment is saved via `POST /api/projects/:projectId/documents/:documentId/comments` with:
   - Comment text
   - Page number
   - X/Y position coordinates (relative to page dimensions)
   - Associated file version ID
8. The marker persists on the page and the comment appears in the sidebar

### Viewing Comments

The Comments tab in the sidebar shows all comments for the document:

| Field | Description |
|-------|-------------|
| Author | Who wrote the comment |
| Text | The comment content |
| Page | Which PDF page the comment is on |
| Timestamp | When the comment was created |
| Status | Whether the comment is resolved or open |

### Comment Markers

Markers are visual indicators on the PDF page showing where comments are placed:
- Each marker corresponds to a comment's X/Y position on a specific page
- Markers are only visible on the page they belong to
- Clicking a marker in the sidebar scrolls to and highlights the corresponding position on the PDF
- Resolved comments may have a different marker style

## User Interactions

| Action | How | Result |
|--------|-----|--------|
| Create comment | Click on PDF page | Places marker, opens comment input |
| View all comments | Open Comments tab in sidebar | Scrollable list of all comments |
| Jump to comment location | Click "Jump to page" on a comment | PDF scrolls to that page, marker highlighted |
| Resolve comment | Click resolve button on comment | Comment marked as resolved |
| Unresolve comment | Click unresolve button | Comment reopened |
| Filter: all comments | Click "Show All Comments" toggle | Shows comments from all users |
| Filter: my comments | Click "Show My Comments" toggle | Shows only your comments |

## Data Model

```
Comment {
  id: string
  documentId: string
  text: string
  pageNumber: number
  position: { x: number, y: number }  // relative coordinates
  isResolved: boolean
  createdBy: User
  createdAt: string
}
```

## States

- **No comments:** Empty state in sidebar prompting to add first comment
- **Loading:** Spinner while comments fetch
- **With comments:** List of comments, markers visible on PDF
- **Resolved:** Resolved comments can be shown/hidden via filter
