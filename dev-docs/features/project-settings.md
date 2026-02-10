# Project Settings

## Overview

Project settings allow managing the project's parties (teams/organizations), their members, and document-level permissions. This is where fine-grained access control is configured.

## Route

`/projects/:id/settings`

## Components

- `src/views/project/ProjectSettings.vue` - Main settings view

## Layout

The settings page has two tabs:

### Details Tab

Displays project information (currently read-only):
- **Project Name** - text field (disabled, shows "Coming Soon" message)
- **Project Description** - text field (disabled)
- **Save Changes** button (disabled)

### Parties Tab

The main management interface for team organization and permissions.

#### Toolbar

| Element | Description |
|---------|-------------|
| Clear Filters button | Resets all active filters |
| Party selector dropdown | Filter members table by a specific party |
| "New Party" button | Opens dialog to create a new party |
| "Add Member" button | Opens dialog to add a user to a party (disabled if no parties exist) |
| Search field | Filter members by name |

#### Members Table

| Column | Description |
|--------|-------------|
| Full Name | Member's name, with a "(You)" badge if it's the current user |
| Email | Member's email address |
| Party | Which party the member belongs to |
| Actions | Delete button (disabled for your own membership) |

#### Party Cards

Below the members table, each party is displayed as a card showing:
- **Party name** and member count
- **Metadata** (if present): VAT number, contact email, phone, address
- **Permission count** - how many document types have permissions configured
- **Edit button** - opens the edit party dialog
- **Delete button** - confirmation dialog, then deletes the party

## User Interactions

### Create a Party

1. Click "New Party" button
2. Fill in the dialog fields:
   - **Name** (required) - party name
   - **Description** (optional)
   - **VAT Number** (optional)
   - **Contact Email** (optional)
   - **Phone** (optional)
   - **Address** (optional)
3. Click "Create" - party appears immediately in the list

### Add a Member

1. Click "Add Member" button
2. Select a **Party** from the dropdown
3. Select a **User** from the dropdown (shows tenant users not already in the party)
4. Click "Add" - member appears in the members table

### Edit Party Details & Permissions

1. Click "Edit" on a party card
2. Edit dialog has two sections:
   - **Details:** Name, description, metadata fields
   - **Document Permissions:** A grid showing all document types in the tenant, each with a dropdown to set the permission level:
     - None (no access)
     - View (can see documents of this type)
     - Comment (can see and comment)
     - Decide (can see, comment, and approve/decline)
3. Click "Save" to apply changes

### Remove a Member

1. Click the delete icon next to a member in the table
2. Confirmation dialog appears
3. Confirm to remove the member from the party

**Note:** You cannot remove yourself from a party.

### Delete a Party

1. Click "Delete" on a party card
2. Confirmation dialog appears
3. Confirm to delete the party and all its memberships

## States

- **Loading:** Spinner while project data loads
- **No parties:** Empty state in the parties section with prompt to create first party
- **No members:** Empty members table with prompt to add members
- **Error:** Toast notification on failed operations
