# Landing Page

## Overview

The landing page is the public-facing marketing page for CedarStack DMS. It showcases the platform's features, permission model, pricing, and document types to potential users.

## Route

`/` (home)

## Components

- `src/views/HomeView.vue` - Landing page

## Sections

### Hero Section

- Headline introducing CedarStack as an "Intelligent Document Hub"
- Subheadline describing the platform's purpose
- "Get Started Free" call-to-action button (triggers Keycloak login)
- "See Features" button (scrolls to features section)

### Feature Cards

Nine cards showcasing platform capabilities:

| Feature | Description |
|---------|-------------|
| Project-Based Organization | Organize documents into projects |
| Contextual Comments | Position-based annotations on PDFs |
| Approval Workflows | Request and track document approvals |
| Digital Signatures | Request and manage signatures |
| Version Control | Track document revisions |
| Smart Notifications | Stay informed about activity |
| Multi-Party Collaboration | Organize users into parties with permissions |
| Organization Management | Manage teams and roles |
| Enterprise Security | Role-based access control |

### Permission System Diagram

Visual explanation of the 4-layer permission hierarchy:

1. **Organization Roles** - Owner, Admin, Member
2. **Project Membership** - Access to specific projects
3. **Party Permissions** - Per-document-type permissions (View, Comment, Decide)
4. **User Overrides** - Individual exceptions

Includes real-world example scenarios (Contractor, Client, Insurance Company).

### Pricing Plans

Three tiers displayed as cards:

| Plan | Key Limits |
|------|-----------|
| Free | 3 projects, 50 documents, 500MB storage, 5 users |
| Pro | 25 projects, 500 documents, 10GB storage, 25 users, versioning |
| Enterprise | Unlimited everything, OCR, API access, advanced reporting |

### Document Types Section

Shows example document categories: Project Information, Damage Reports, Inventory, Quotes, Contracts, Hours Confirmation, Invoices.

### Footer

Brand information and navigation links.

## User Interactions

| Action | How | Result |
|--------|-----|--------|
| Sign up / Sign in | Click "Get Started Free" | Redirects to Keycloak login |
| Browse features | Scroll down or click "See Features" | Scrolls to features section |
| View pricing | Scroll to pricing section | See plan comparison |

## States

- **Unauthenticated:** Full landing page visible
- **Authenticated:** User is typically redirected to `/projects` by navigation, but can still visit `/`
