# Search

## Overview

Full-text search across all documents the user has access to. Search can be scoped to a specific project or run across all projects.

## Route

`/search?q=:query` or `/search?q=:query&projectId=:projectId`

## Components

- `src/views/search/SearchResults.vue` - Search results page
- `src/composables/useSearch.ts` - Search state management
- `src/services/SearchService.ts` - Search API calls

## How It Works

1. User types a search query in the header search bar
2. The app navigates to `/search?q=<query>`
3. The search composable calls `GET /api/search?q=<query>` (optionally with `&projectId=<id>`)
4. Results are displayed as cards

## Search Results Page

### Header

- Search input field (pre-filled with current query)
- Project scope badge (if searching within a project), with an "Search all projects" button to remove the scope

### Results

Each result card shows:

| Element | Description |
|---------|-------------|
| Document icon | File type indicator |
| Title | Document name (clickable - navigates to document viewer) |
| Project name | Which project the document belongs to (with folder icon) |
| Snippet | Text excerpt with search term highlighted |
| Document type badge | The document's type label |

### Footer

- Result count (e.g., "12 results")
- Pagination controls for navigating large result sets

## User Interactions

| Action | How | Result |
|--------|-----|--------|
| Search | Type query in search bar, press Enter | Navigate to search results page |
| Open result | Click on a result card | Navigate to document viewer |
| Clear project scope | Click "Search all projects" | Re-run search across all projects |
| Paginate | Click page numbers | Navigate to next/previous page of results |

## States

- **Loading:** Spinner while search executes
- **No results:** Empty state with message "No results found"
- **Results:** List of result cards
- **Error:** Error message if search fails
